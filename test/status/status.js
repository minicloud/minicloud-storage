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
        var paths = global.storeContext.path
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
        var paths = global.storeContext.path
        for (var i = 0; i < paths.length; i++) {
            var subPath = paths[i]
            yield file.mkdirp(subPath)
        }
        var sessionId = '1234'
        var time = new Date().getTime()
        var res = yield request(app)
            .post('/api/v1/status/info')
            .type('json')
            .send({
                signature: '1234567',
                session_id: sessionId,
                time: time
            })
            .expect(401)
            .end()
        res.body.error.should.equal('invalid_signature')
        done()
    })
    it(' status/info 409', function*(done) {
        var sessionId = '1234'
        var time = new Date().getTime()
        time-=24*60*60*1000+10
        var signature = md5(sessionId + time + global.storeContext.safe_code)
        var res = yield request(app)
            .post('/api/v1/status/info')
            .type('json')
            .send({
                signature: signature,
                session_id: sessionId,
                time: time
            })
            .expect(409)
            .end()
        res.body.error.should.equal('session_timeout')
        done()
    })
    it(' status/info 200', function*(done) {
        var paths = global.storeContext.path
        for (var i = 0; i < paths.length; i++) {
            var subPath = paths[i]
            yield file.mkdirp(subPath)
        }
        var sessionId = '1234'
        var time = new Date().getTime()
        var signature = md5(sessionId + time + global.storeContext.safe_code)
        var res = yield request(app)
            .post('/api/v1/status/info')
            .type('json')
            .send({
                signature: signature,
                session_id: sessionId,
                time: time
            })
            .expect(200)
            .end()
        assert.equal(res.body.length > 0, true)
        done()
    })
    it(' status/info socket.io 200', function*(done) {
        var paths = global.storeContext.path
        for (var i = 0; i < paths.length; i++) {
            var subPath = paths[i]
            yield file.mkdirp(subPath)
        }
        var sessionId = '1234'
        var time = new Date().getTime()
        var signature = md5(sessionId + time + global.storeContext.safe_code)
        global.socket.emit('/api/v1/status/info', {
            data: {
                signature: signature,
                session_id: sessionId,
                time: time
            }
        }, function(body) {
            assert.equal(body.length > 0, true)
            done()
        })
    })
})
