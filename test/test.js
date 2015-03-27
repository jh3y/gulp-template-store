var assert, tmplStore;

assert = require('assert');

tmplStore = require('../lib/index');

suite('tmplStore', function() {
  return test('tmplStore is a function', function() {
    return assert.equal(typeof tmplStore, 'function');
  });
});
