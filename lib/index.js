var PLUGIN_NAME, through, util;

through = require('through2');

util = require('gulp-util');

PLUGIN_NAME = 'gulp-store';

module.exports = function(opts, data, options) {
  var end, files, write;
  console.log(arguments);
  console.log('You are using', PLUGIN_NAME);
  files = [];
  write = function(file, enc, cb) {
    files.push(file);
    return cb();
  };
  end = function(cb) {
    this.push(new util.File({
      path: 'templates.js',
      contents: new Buffer('I am the contents')
    }));
    return cb();
  };
  return through.obj(write, end);
};
