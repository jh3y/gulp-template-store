through = require 'through2'
util = require 'gulp-util'
_ = require 'lodash'
PLUGIN_NAME = 'gulp-store'

templateStore = (opt, _opt) ->
  ext = '.html'
  rootDir = process.cwd()
  opt = opt or {}
  files = []
  # template file name will default to templates.js
  fileName = if opt.name and typeof opt.name is 'string' then opt.name else 'templates.js'
  processFile = (file) ->
    str = file.path
    base = if opt.base and typeof opt.base is 'string' then opt.base else rootDir + '/'
    key = str.slice(str.indexOf(base) + base.length, str.length - ext.length)
    return _.template('"<%= name %>": <%= contents %>')(
      name: key
      contents: _.template(file.contents.toString()).source
    )
  processInput = ->
    _.template('this.JST = { <%= contents %> };')(
      contents: _.map(files, processFile).join(',')
    )
  gather = (file, enc, cb) ->
    if file.isNull()
      cb()
      return
    if file.isStream()
      this.emit 'error', new util.PluginError PLUGIN_NAME, 'Streaming is not supported'
      cb()
      return
    files.push file
    cb()
  end = (cb) ->
    this.push new util.File
      path: fileName
      contents: new Buffer processInput()
    cb()
  through.obj gather, end

module.exports = templateStore
