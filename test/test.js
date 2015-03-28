var PLUGIN_NAME, assert, expect, gulp, path, tmplStore, util;

assert = require('stream-assert');

expect = require('chai').expect;

tmplStore = require('../lib/index');

path = require('path');

util = require('gulp-util');

gulp = require('gulp');

PLUGIN_NAME = 'gulp-template-store';

suite(PLUGIN_NAME, function() {
  test('should expose a function', function() {
    return expect(typeof tmplStore).to.equal('function');
  });
  test('should ignores null files', function(done) {
    var stream;
    stream = tmplStore();
    stream.pipe(assert.length(0)).pipe(assert.end(done));
    stream.write(new util.File());
    return stream.end();
  });
  return test('should emit error on streams', function(done) {
    return gulp.src(path.join(process.cwd(), 'src/jade/templates/**/*.jade'), {
      buffer: false
    }).pipe(tmplStore()).on('error', function(err) {
      expect(err.message).to.equal('Streaming is not supported');
      return done();
    });
  });
});
