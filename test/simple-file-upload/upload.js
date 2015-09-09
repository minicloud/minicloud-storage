var request = require('co-supertest')
var fs = require('fs')
var fsPlus = require('co-fs-plus')
var context = require('../context')
var fileHelpers = require('../../lib/file-helpers')
var assert = require('assert')
var md5 = require('md5')

describe(' files/upload_session/send', function() {
    this.timeout(30000)
    var app = null
    before(function*(done) {
        app = yield context.getApp()
        return done()
    })
    it(' /files/upload_session/send 400', function*(done) {
        yield request(app)
            .post('/api/v1/files/upload_session/send')
            .type('json')
            .expect(400)
            .end()
        done()
    })
    it(' /files/upload_session/send 401', function*(done) {
        var time = new Date().getTime()
        var res = yield request(app)
            .post('/api/v1/files/upload_session/send')
            .type('json')
            .send({
                session_id: '12345',
                signature: '1234567',
                time: time
            })
            .expect(401)
            .end()
        res.body.error.should.equal('invalid_signature')
        done()
    })
    it(' /files/upload_session/send 409', function*(done) {
        var sessionId = '1234'
        var time = new Date().getTime()
        time -= 24 * 60 * 60 + 10
        var signature = md5(sessionId + time + global.appContext.safe_code)
        var res = yield request(app)
            .post('/api/v1/files/upload_session/send')
            .type('json')
            .send({
                session_id: sessionId,
                signature: signature,
                time: time
            })
            .expect(409)
            .end()
        res.body.error.should.equal('session_timeout')
        done()
    })
    it(' /files/upload_session/send 200', function*(done) {
        var sessionId = '1234'
        var time = new Date().getTime()
        var signature = md5(sessionId + time + global.appContext.safe_code)
        var res = yield request(app)
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
        res.body.hash.should.equal('47618d22b1830e42684579364e62f89000237433')
        res.body.size.should.equal(452)
            //assert data 
        var path = yield fileHelpers.find(global.appContext.path, '47618d22b1830e42684579364e62f89000237433')
        assert(fs.existsSync(path), true)
            //assert cache
        var files = yield fsPlus.walk('./cache')
        assert(files.length + 1, 1)
        done()
    })
    it(' /files/upload_session/send socket.io 200', function*(done) {
        var sessionId = '1234'
        var time = new Date().getTime()
        var signature = md5(sessionId + time + global.appContext.safe_code)
        var fs = require('fs')
        fs.readFile('./test/test-files/lt-1k.js', function(err, buf) {
            global.socket.emit('/api/v1/files/upload_session/send', {
                header: {
                    'MiniCloud-API-Arg': JSON.stringify({
                        session_id: sessionId,
                        signature: signature,
                        time: time
                    })
                },
                buffer: buf
            }, function(body) {
                body.hash.should.equal('47618d22b1830e42684579364e62f89000237433')
                body.size.should.equal(452)
                done()
            })
        })
    })
})
