through = require 'through2'
util    = require 'gulp-util'
path    = require 'path'
_       = require 'lodash'

PLUGIN_NAME = 'gulp-template-store'
rootDir = process.cwd()

templateStore = (opt) ->
  opt = opt or {}
  _opt = opt.options or {}
  files = []
  fileName = if opt.name and typeof opt.name is 'string' then opt.name else 'templates.js'
  fileVar = if opt.variable and typeof opt.variable is 'string' then opt.variable else 'this.tmpl'
  base = if opt.base and typeof opt.base is 'string' then opt.base else rootDir + '/'
  base = base.replace /\\|\//g, path.sep
  tmpl = fileVar + ' = { <%= contents %> };'

  getTemplateFn = (file) ->
    if _opt.interpolate
      _.templateSettings.interpolate = _opt.interpolate
    _.template(file.contents.toString(), _opt).source

  processFile = (file) ->
    str = file.path
    key = str.slice(str.indexOf(base) + base.length, str.lastIndexOf('.'))
    key = key.replace /\\|\//g, '/'
    return _.template('"<%= name %>": <%= contents %>')(
      name: key
      contents: if opt.bare then file.contents.toString() else getTemplateFn file
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
    if files.length > 0
      this.push new util.File
        path: fileName
        contents: new Buffer processInput()
    cb()
  through.obj gather, end

module.exports = templateStore
