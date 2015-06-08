assert = require 'stream-assert'
expect = require('chai').expect
tmplStore = require '../lib/index'
path = require 'path'
util = require 'gulp-util'
gulp = require 'gulp'
vm = require 'vm'
_ = require 'lodash'
PLUGIN_NAME = 'gulp-template-store'

getCompiledResult = (result) ->
  sandbox =
    _: require 'lodash'
  vm.runInNewContext result, sandbox
  sandbox

genFile = (path, contents) ->
  path = if path then path else 'test.js'
  contents = if contents then contents else '<div><%= test %></div>'
  new util.File
    path: process.cwd() + path
    contents: new Buffer contents

suite PLUGIN_NAME, ->
  suite 'tmplStore()', ->
    test 'should expose a function', ->
      expect(typeof tmplStore).to.equal 'function'

    test 'should ignores null files', (done) ->
      stream = tmplStore()
      stream
        .pipe(assert.length(0))
        .pipe(assert.end(done))
      stream.write new util.File()
      stream.end()

    test 'should emit error on streams', (done) ->
      gulp.src(path.join(__dirname, '/templates/**/*.html'), {buffer: false})
        .pipe(tmplStore())
        .on('error', (err) ->
          expect(err.message).to.equal 'Streaming is not supported'
          done()
        )

    test 'outputs one file', (done) ->
      gulp.src(path.join(__dirname, '/templates/**/*.html'))
        .pipe(tmplStore())
        .pipe(assert.length(1))
        .pipe(assert.end(done))

    test 'should not fail when options are populated but there is no data', (done) ->
      stream = tmplStore
        name: 'test.js'
        variable: 'TMPL'
      stream.pipe(assert.length(0))
        .pipe(assert.end(done))
      stream.end()

    test 'outputs correct default root key', (done) ->
      gulp.src(path.join(__dirname + '/templates/a.html'))
        .pipe(tmplStore())
        .pipe(assert.first((d) ->
          comp = getCompiledResult d.contents.toString()
          expect(comp.tmpl).to.not.be.undefined
        ))
        .pipe(assert.end(done))

    test 'generates correct number of template keys', (done) ->
      gulp.src([__dirname + '/templates/a.html', __dirname + '/templates/b.html'])
        .pipe(tmplStore())
        .pipe(assert.first((d) ->
          comp = getCompiledResult d.contents.toString()
          expect(Object.keys(comp.tmpl).length).to.equal 2
        ))
        .pipe(assert.end(done))

    test 'sets template key by default to template path in repo', (done) ->
      gulp.src(__dirname + '/templates/a.html')
        .pipe(tmplStore())
        .pipe(assert.first((d) ->
          comp = getCompiledResult d.contents.toString()
          expect(comp.tmpl['test/templates/a']).to.not.be.undefined
        ))
        .pipe(assert.end(done))

    test 'generates correct lodash template sources', (done) ->
      fakeFile = genFile()
      testTmpl = _.template('<div><%= test %></div>').sources
      stream = tmplStore()
      stream.on 'data', (file) ->
        comp = getCompiledResult file.contents.toString()
        tmplStoreRes = comp.tmpl['test'].sources
        expect(tmplStoreRes).to.equal testTmpl
      stream.write fakeFile
      stream.end(done)

    test 'generates lodash templates that work correctly', (done) ->
      fakeFile = genFile()
      testTmpl = _.template '<div><%= test %></div>'
      stream = tmplStore()
      stream.on 'data', (file) ->
        comp = getCompiledResult file.contents.toString()
        testVar = 'PASSING'
        _Res = testTmpl
          test: testVar
        tmplStoreRes = comp.tmpl['test']
          test: testVar
        expect(tmplStoreRes).to.equal _Res
      stream.write fakeFile
      stream.end(done)

    suite 'opts', ->
      test 'correct filename generated with name opt', (done) ->
        fakeFile = genFile()
        stream = tmplStore
          name: 'test-templates.js'
        stream.on 'data', (file) ->
          expect(file.path).to.equal 'test-templates.js'
        stream.write fakeFile
        stream.end done

      test 'barezzz', (done) ->
        a = ->
        fakeFile = genFile('a.js', a.toString())
        stream = tmplStore
          bare: true
        stream.on 'data', (file) ->
          res = getCompiledResult file.contents.toString()
          expect(res.tmpl.a.toString()).to.equal a.toString()
        stream.write fakeFile
        stream.end done

      test 'correct root variable defined with variable opt', (done) ->
        fakeFile = genFile()
        stream = tmplStore
          variable: 'this.templates'
        stream.on 'data', (file) ->
          comp = getCompiledResult file.contents.toString()
          expect(comp.templates).to.not.be.undefined
        stream.write fakeFile
        stream.end done

      test 'correct keys defined for templates when using base opt', (done) ->
        gulp.src(__dirname + '/templates/a.html')
          .pipe(tmplStore({
            base: 'test/templates/'
          }))
          .pipe(assert.first((d) ->
            comp = getCompiledResult d.contents.toString()
            expect(comp.tmpl['a']).to.not.be.undefined
          ))
          .pipe(assert.end(done))

      test 'correct output when using interpolate setting with for example handlebars', (done) ->
        fakeFile = new util.File
          path: process.cwd() + 'test.js'
          contents: new Buffer '<div>{{ test }}</div>'
        _Res = _.template('<div>{{ test }}</div>',
          interpolate:  /{{([\s\S]+?)}}/g
        )(
          test: 'PASSING'
        )
        stream = tmplStore
          options:
            interpolate: /{{([\s\S]+?)}}/g
        stream.on 'data', (file) ->
          comp = getCompiledResult file.contents.toString()
          tmplStoreRes = comp.tmpl['test']
            test: 'PASSING'
          expect(tmplStoreRes).to.equal _Res
        stream.write fakeFile
        stream.end done
