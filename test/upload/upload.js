var request = require('co-supertest')
var file = require('co-fs-plus')
var context = require('../context')
var assert = require('assert')
describe(' files/upload', function() {
    this.timeout(10000)
    var app = null
    before(function*(done) {
        app = yield context.getApp()
        return done()
    })
    it(' /files/upload 401', function*(done) {        
        yield request(app)
            .post('/api/v1/files/upload')
            .attach('file', './test/test-files/lt-1k.js')
            .expect(200)
            .end()
        done()
    })
})
