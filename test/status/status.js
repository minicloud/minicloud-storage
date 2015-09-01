var request = require('co-supertest')
var file = require('co-fs-plus')
var context = require('../context')
var assert = require('assert')
var md5 = require('md5')
describe(' status', function() {
    this.timeout(10000)
    var app = null
    before(function*(done) {
        app = yield context.getApp()
        return done()
    })
    it(' status/info 400', function*(done) {
        var paths = global.appContext.path
        for (var i = 0; i < paths.length; i++) {
            var subPath = paths[i]
            yield file.mkdirp(subPath)
        }
        yield request(app)
            .post('/api/v1/status/info')
            .type('json')
            .expect(400)
            .end()
        done()
    })
    it(' status/info 401', function*(done) {
        var paths = global.appContext.path
        for (var i = 0; i < paths.length; i++) {
            var subPath = paths[i]
            yield file.mkdirp(subPath)
        }
        var sessionId = '1234'
        var res = yield request(app)
            .post('/api/v1/status/info')
            .type('json')
            .send({
                signature: '1234567',
                session_id: sessionId
            })
            .expect(401)
            .end()
        res.body.error.should.equal('invalid_signature')
        done()
    })
    it(' status/info 200', function*(done) {
        var paths = global.appContext.path
        for (var i = 0; i < paths.length; i++) {
            var subPath = paths[i]
            yield file.mkdirp(subPath)
        }
        var sessionId = '1234'
        var signature = md5(global.appContext.safe_code + sessionId)
        var res = yield request(app)
            .post('/api/v1/status/info')
            .type('json')
            .send({
                signature: signature,
                session_id: sessionId
            })
            .expect(200)
            .end()
        assert(res.body.length > 0, true)
        done()
    })
})
