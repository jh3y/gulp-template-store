assert = require 'stream-assert'
expect = require('chai').expect
tmplStore = require '../lib/index'
path = require 'path'
util = require 'gulp-util'
gulp = require 'gulp'
PLUGIN_NAME = 'gulp-template-store'

suite PLUGIN_NAME, ->
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
    gulp.src(path.join(process.cwd(), 'src/jade/templates/**/*.jade'), {buffer: false})
      .pipe(tmplStore())
      .on('error', (err) ->
        expect(err.message).to.equal 'Streaming is not supported'
        done()
      )
