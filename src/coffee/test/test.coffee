assert = require 'assert'
tmplStore = require '../lib/index'
suite 'tmplStore', ->
  test 'tmplStore is a function', ->
    assert.equal typeof tmplStore, 'function'
