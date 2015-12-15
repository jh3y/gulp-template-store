var PLUGIN_NAME, _, assert, expect, genFile, getCompiledResult, gulp, os, path, tmplStore, util, vm;

assert = require('stream-assert');

expect = require('chai').expect;

tmplStore = require('../lib/index');

path = require('path');

util = require('gulp-util');

gulp = require('gulp');

vm = require('vm');

os = require('os');

_ = require('lodash');

PLUGIN_NAME = 'gulp-template-store';

getCompiledResult = function(result) {
  var sandbox;
  sandbox = {
    _: require('lodash')
  };
  vm.runInNewContext(result, sandbox);
  return sandbox;
};

genFile = function(path, contents) {
  path = path ? path : 'test.html';
  contents = contents ? contents : '<div><%= test %></div>';
  return new util.File({
    path: process.cwd() + path,
    contents: new Buffer(contents)
  });
};

suite(PLUGIN_NAME, function() {
  return suite('tmplStore()', function() {
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
    test('should emit error on streams', function(done) {
      return gulp.src(path.join(__dirname, '/templates/**/*.html'), {
        buffer: false
      }).pipe(tmplStore()).on('error', function(err) {
        expect(err.message).to.equal('Streaming is not supported');
        return done();
      });
    });
    test('outputs one file', function(done) {
      return gulp.src(path.join(__dirname, '/templates/**/*.html')).pipe(tmplStore()).pipe(assert.length(1)).pipe(assert.end(done));
    });
    test('should not fail when options are populated but there is no data', function(done) {
      var stream;
      stream = tmplStore({
        name: 'test.js',
        variable: 'TMPL'
      });
      stream.pipe(assert.length(0)).pipe(assert.end(done));
      return stream.end();
    });
    test('outputs correct default root key', function(done) {
      return gulp.src(path.join(__dirname + '/templates/a.html')).pipe(tmplStore()).pipe(assert.first(function(d) {
        var comp;
        comp = getCompiledResult(d.contents.toString());
        return expect(comp.tmpl).to.not.be.undefined;
      })).pipe(assert.end(done));
    });
    test('generates correct number of template keys', function(done) {
      return gulp.src([__dirname + '/templates/a.html', __dirname + '/templates/b.html']).pipe(tmplStore()).pipe(assert.first(function(d) {
        var comp;
        comp = getCompiledResult(d.contents.toString());
        return expect(Object.keys(comp.tmpl).length).to.equal(2);
      })).pipe(assert.end(done));
    });
    test('sets template key by default to template path in repo', function(done) {
      var expKey;
      expKey = 'test/templates/a'.replace(/\\|\//g, path.sep);
      return gulp.src(__dirname + '/templates/a.html').pipe(tmplStore()).pipe(assert.first(function(d) {
        var comp;
        comp = getCompiledResult(d.contents.toString());
        return expect(comp.tmpl[expKey]).to.not.be.undefined;
      })).pipe(assert.end(done));
    });
    test('converts path separator correctly for given base', function(done) {
      var base, expKey, oppoSep;
      oppoSep = path.sep === '/' ? '\\' : '/';
      base = oppoSep + 'test' + oppoSep;
      expKey = 'templates/a'.replace(/\\|\//g, path.sep);
      return gulp.src(__dirname + '/templates/a.html').pipe(tmplStore({
        base: base
      })).pipe(assert.first(function(d) {
        var comp;
        comp = getCompiledResult(d.contents.toString());
        return expect(comp.tmpl[expKey]).to.not.be.undefined;
      })).pipe(assert.end(done));
    });
    test('generates correct lodash template sources', function(done) {
      var fakeFile, stream, testTmpl;
      fakeFile = genFile();
      testTmpl = _.template('<div><%= test %></div>').sources;
      stream = tmplStore();
      stream.on('data', function(file) {
        var comp, tmplStoreRes;
        comp = getCompiledResult(file.contents.toString());
        tmplStoreRes = comp.tmpl['test'].sources;
        return expect(tmplStoreRes).to.equal(testTmpl);
      });
      stream.write(fakeFile);
      return stream.end(done);
    });
    test('generates lodash templates that work correctly', function(done) {
      var fakeFile, stream, testTmpl;
      fakeFile = genFile();
      testTmpl = _.template('<div><%= test %></div>');
      stream = tmplStore();
      stream.on('data', function(file) {
        var _Res, comp, testVar, tmplStoreRes;
        comp = getCompiledResult(file.contents.toString());
        testVar = 'PASSING';
        _Res = testTmpl({
          test: testVar
        });
        tmplStoreRes = comp.tmpl['test']({
          test: testVar
        });
        return expect(tmplStoreRes).to.equal(_Res);
      });
      stream.write(fakeFile);
      return stream.end(done);
    });
    return suite('opts', function() {
      test('correct filename generated with name opt', function(done) {
        var fakeFile, stream;
        fakeFile = genFile();
        stream = tmplStore({
          name: 'test-templates.js'
        });
        stream.on('data', function(file) {
          return expect(file.path).to.equal('test-templates.js');
        });
        stream.write(fakeFile);
        return stream.end(done);
      });
      test('UNIX option is respected by template store', function(done) {
        var a, expKey, expKeyUNIX, fakeFile, stream;
        a = function() {};
        fakeFile = genFile('/templates/test/test.js');
        expKeyUNIX = 'test/test';
        expKey = os.platform() === 'win32' ? 'test\\test' : 'test/test';
        stream = tmplStore({
          unix: true,
          base: 'templates\\'
        });
        stream.on('data', function(file) {
          var res;
          res = getCompiledResult(file.contents.toString());
          return expect(res.tmpl[expKeyUNIX]).to.not.be.undefined;
        });
        stream.write(fakeFile);
        stream = tmplStore({
          unix: false,
          base: 'templates\\'
        });
        stream.on('data', function(file) {
          var res;
          res = getCompiledResult(file.contents.toString());
          return expect(res.tmpl[expKey]).to.not.be.undefined;
        });
        stream.write(fakeFile);
        return stream.end(done);
      });
      test('barezzz', function(done) {
        var a, fakeFile, stream;
        a = function() {};
        fakeFile = genFile('a.js', a.toString());
        stream = tmplStore({
          bare: true
        });
        stream.on('data', function(file) {
          var res;
          res = getCompiledResult(file.contents.toString());
          return expect(res.tmpl.a.toString()).to.equal(a.toString());
        });
        stream.write(fakeFile);
        return stream.end(done);
      });
      test('correct root variable defined with variable opt', function(done) {
        var fakeFile, stream;
        fakeFile = genFile();
        stream = tmplStore({
          variable: 'this.templates'
        });
        stream.on('data', function(file) {
          var comp;
          comp = getCompiledResult(file.contents.toString());
          return expect(comp.templates).to.not.be.undefined;
        });
        stream.write(fakeFile);
        return stream.end(done);
      });
      test('correct keys defined for templates when using base opt', function(done) {
        return gulp.src(__dirname + '/templates/a.html').pipe(tmplStore({
          base: 'test/templates/'
        })).pipe(assert.first(function(d) {
          var comp;
          comp = getCompiledResult(d.contents.toString());
          return expect(comp.tmpl['a']).to.not.be.undefined;
        })).pipe(assert.end(done));
      });
      return test('correct output when using interpolate setting with for example handlebars', function(done) {
        var _Res, fakeFile, stream;
        fakeFile = genFile('test.js', '<div>{{ test }}</div>');
        _Res = _.template('<div>{{ test }}</div>', {
          interpolate: /{{([\s\S]+?)}}/g
        })({
          test: 'PASSING'
        });
        stream = tmplStore({
          options: {
            interpolate: /{{([\s\S]+?)}}/g
          }
        });
        stream.on('data', function(file) {
          var comp, tmplStoreRes;
          comp = getCompiledResult(file.contents.toString());
          tmplStoreRes = comp.tmpl['test']({
            test: 'PASSING'
          });
          return expect(tmplStoreRes).to.equal(_Res);
        });
        stream.write(fakeFile);
        return stream.end(done);
      });
    });
  });
});
