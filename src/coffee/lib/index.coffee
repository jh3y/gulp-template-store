through = require 'through2'
util = require 'gulp-util'
PLUGIN_NAME = 'gulp-store'

module.exports = (opts, data, options) ->
  console.log arguments
  # console.log opts, data, options
  console.log 'You are using', PLUGIN_NAME
  files = []
  write = (file, enc, cb) ->
    files.push file
    cb()
  end = (cb) ->
    this.push new util.File
      path: 'templates.js'
      contents: new Buffer 'I am the contents'
    # this.queue null
    cb()
  through.obj write, end
