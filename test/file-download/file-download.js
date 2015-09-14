var request = require('co-supertest')
var context = require('../context')
var assert = require('assert')
var md5 = require('md5')
describe(' files/download', function() {
    this.timeout(10000)
    var app = null
    before(function*(done) {
        app = yield context.getApp()
        return done()
    })
    it(' /files/download 400', function*(done) {
        var res = yield request(app)
            .get('/api/v1/files/download')
            .type('json')
            .expect(400)
            .end()
        done()
    })
    it(' /files/download 401', function*(done) {
        var time = new Date().getTime()
        var res = yield request(app)
            .get('/api/v1/files/download?hash=12345&name=1.doc&signature=1234567&time=' + time)
            .type('json')
            .expect(401)
            .end()
        res.body.error.should.equal('invalid_signature')
        done()
    })
    it(' /files/download 409 session_timeout', function*(done) {
        var sessionId = '1234'
        var time = new Date().getTime()
        time -= 24 * 60 * 60 * 1000 + 10
        var signature = md5(sessionId + time + global.appContext.safe_code)
        var res = yield request(app)
            .get('/api/v1/files/download?hash=123456&name=1.doc&signature=' + signature + '&time=' + time)
            .type('json')
            .expect(409)
            .end()
        res.body.error.should.equal('session_timeout')
        done()
    })
    it(' /files/download 409 hash_not_exist', function*(done) {
        var hash = '1234'
        var time = new Date().getTime()
        var signature = md5(hash + time + global.appContext.safe_code)
        var res = yield request(app)
            .get('/api/v1/files/download?hash=' + hash + '&name=1.doc&signature=' + signature + '&time=' + time)
            .type('json')
            .expect(409)
            .end()
        res.body.error.should.equal('hash_not_exist')
        done()
    })
    it(' /files/download 200', function*(done) {
        //upload file
        var sessionId = '1234'
        var time = new Date().getTime()
        var signature = md5(sessionId + time + global.appContext.safe_code)
        yield request(app)
            .post('/api/v1/files/upload_session/send')
            .set({
                'MiniCloud-API-Arg': JSON.stringify({
                    session_id: sessionId,
                    signature: signature,
                    time: time
                })
            })
            .attach('file', './test/test-files/lt-1k.js')
            .expect(200)
            .end()
            //download file
        var hash = '47618d22b1830e42684579364e62f89000237433'
        var time = new Date().getTime()
        var signature = md5(hash + time + global.appContext.safe_code)
        yield request(app)
            .get('/api/v1/files/download?hash=' + hash + '&name=测试.doc&signature=' + signature + '&time=' + time)
            .expect(200)
            .end()
        done()
    })
})
