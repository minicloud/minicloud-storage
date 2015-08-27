var request = require('co-supertest')
var context = require('../context')
var assert = require('assert')
describe(' file-helpers.js', function() {
    this.timeout(10000)
    var app = null
    before(function*(done) {
        app = yield context.getApp()
        return done()
    })
    it('getFileSha1', function*(done) { 
        var fileHelpers = require('../../lib/file-helpers') 
        var hash = yield fileHelpers.getFileSha1('./test/test-files/lt-1k.js')
        assert(hash,'47618d22b1830e42684579364e62f89000237433')
        done()
    })
})
