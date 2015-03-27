var PLUGIN_NAME, _, templateStore, through, util;

through = require('through2');

util = require('gulp-util');

_ = require('lodash');

PLUGIN_NAME = 'gulp-store';

templateStore = function(opt, _opt) {
  var end, ext, fileName, files, gather, processFile, processInput, rootDir;
  ext = '.html';
  rootDir = process.cwd();
  opt = opt || {};
  files = [];
  fileName = opt.name && typeof opt.name === 'string' ? opt.name : 'templates.js';
  processFile = function(file) {
    var base, key, str;
    str = file.path;
    base = opt.base && typeof opt.base === 'string' ? opt.base : rootDir + '/';
    key = str.slice(str.indexOf(base) + base.length, str.length - ext.length);
    return _.template('"<%= name %>": <%= contents %>')({
      name: key,
      contents: _.template(file.contents.toString()).source
    });
  };
  processInput = function() {
    return _.template('this.JST = { <%= contents %> };')({
      contents: _.map(files, processFile).join(',')
    });
  };
  gather = function(file, enc, cb) {
    if (file.isNull()) {
      cb();
      return;
    }
    if (file.isStream()) {
      this.emit('error', new util.PluginError(PLUGIN_NAME, 'Streaming is not supported'));
      cb();
      return;
    }
    files.push(file);
    return cb();
  };
  end = function(cb) {
    this.push(new util.File({
      path: fileName,
      contents: new Buffer(processInput())
    }));
    return cb();
  };
  return through.obj(gather, end);
};

module.exports = templateStore;
