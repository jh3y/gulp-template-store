var PLUGIN_NAME, _, ext, rootDir, templateStore, through, util;

through = require('through2');

util = require('gulp-util');

_ = require('lodash');

PLUGIN_NAME = 'gulp-template-store';

ext = '.html';

rootDir = process.cwd();


/*
  Lodash options to cater for are interpolate, imports, and variable

  Those are handled via _opt. We just need to check for interpolate setting.
 */

templateStore = function(opt, _opt) {
  var end, fileName, fileVar, files, gather, getTemplateFn, processFile, processInput, tmpl;
  opt = opt || {};
  _opt = _opt || {};
  files = [];
  fileName = opt.name && typeof opt.name === 'string' ? opt.name : 'templates.js';
  fileVar = opt.variable && typeof opt.variable === 'string' ? opt.variable : 'this.tmpl';
  tmpl = fileVar + ' = { <%= contents %> };';
  getTemplateFn = function(file) {
    if (_opt.interpolate) {
      _.templateSettings.interpolate = _opt.interpolate;
    }
    return _.template(file.contents.toString(), _opt).source;
  };
  processFile = function(file) {
    var base, key, str;
    str = file.path;
    base = opt.base && typeof opt.base === 'string' ? opt.base : rootDir + '/';
    key = str.slice(str.indexOf(base) + base.length, str.length - ext.length);
    return _.template('"<%= name %>": <%= contents %>')({
      name: key,
      contents: getTemplateFn(file)
    });
  };
  processInput = function() {
    return _.template(tmpl)({
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
