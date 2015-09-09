var request = require('co-supertest')
var context = require('../context')
var assert = require('assert')
var md5 = require('md5')
describe(' files/thumbnail', function() {
    this.timeout(10000)
    var app = null
    before(function*(done) {
        app = yield context.getApp()
        return done()
    })
    it(' /files/thumbnail 400', function*(done) {
        var res = yield request(app)
            .get('/api/v1/files/thumbnail')
            .type('json')
            .expect(400)
            .end()
        done()
    })
    it(' /files/thumbnail 401', function*(done) {
        var time = new Date().getTime()
        var res = yield request(app)
            .get('/api/v1/files/thumbnail?hash=12345&name=1.png&signature=1234567&time=' + time)
            .type('json')
            .expect(401)
            .end()
        res.body.error.should.equal('invalid_signature')
        done()
    })
    it(' /files/thumbnail 409 session_timeout', function*(done) {
        var sessionId = '1234'
        var time = new Date().getTime()
        time -= 24 * 60 * 60 + 10
        var signature = md5(sessionId + time + global.appContext.safe_code)
        var res = yield request(app)
            .get('/api/v1/files/thumbnail?hash=123456&name=1.png&signature=' + signature + '&time=' + time)
            .type('json')
            .expect(409)
            .end()
        res.body.error.should.equal('session_timeout')
        done()
    })
    it(' /files/thumbnail 409 hash_not_exist', function*(done) {
        var hash = '1234'
        var time = new Date().getTime()
        var signature = md5(hash + time + global.appContext.safe_code)
        var res = yield request(app)
            .get('/api/v1/files/thumbnail?hash=' + hash + '&name=1.doc&signature=' + signature + '&time=' + time)
            .type('json')
            .expect(409)
            .end()
        res.body.error.should.equal('hash_not_exist')
        done()
    })
    it(' /files/thumbnail 200', function*(done) {
        done()
    })
})