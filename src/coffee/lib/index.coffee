through = require 'through2'
util = require 'gulp-util'
_ = require 'lodash'
PLUGIN_NAME = 'gulp-store'
ext = '.html'
rootDir = process.cwd()


###
  Lodash options to cater for are interpolate, imports, and variable

  Those are handled via _opt. We just need to check for interpolate setting.
###

templateStore = (opt, _opt) ->
  opt = opt or {}
  _opt = _opt or {}
  files = []
  fileName = if opt.name and typeof opt.name is 'string' then opt.name else 'templates.js'
  fileVar = if opt.variable and typeof opt.variable is 'string' then opt.variable else 'this.tmpl'

  tmpl = fileVar + ' = { <%= contents %> };'

  getTemplateFn = (file) ->
    if _opt.interpolate
      _.templateSettings.interpolate = _opt.interpolate
    _.template(file.contents.toString(), _opt).source

  processFile = (file) ->
    str = file.path
    base = if opt.base and typeof opt.base is 'string' then opt.base else rootDir + '/'
    key = str.slice(str.indexOf(base) + base.length, str.length - ext.length)
    return _.template('"<%= name %>": <%= contents %>')(
      name: key
      contents: getTemplateFn file
    )

  processInput = ->
    _.template(tmpl)(
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
