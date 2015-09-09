var request = require('co-supertest')
var fs = require('fs')
var fsPlus = require('co-fs-plus')
var context = require('../context')
var fileHelpers = require('../../lib/file-helpers')
var assert = require('assert')
var path = require('path')
var md5 = require('md5')

describe(' files/upload_session/block_append', function() {
    this.timeout(20000)
    var app = null
    before(function*(done) {
        app = yield context.getApp()
        return done()
    })
    it(' /files/upload_session/block_append 400', function*(done) {
        yield request(app)
            .post('/api/v1/files/upload_session/block_append')
            .type('json')
            .expect(400)
            .end()
        done()
    })
    it(' /files/upload_session/block_append 401', function*(done) {
        var sessionId = '1234'
        var res = yield request(app)
            .post('/api/v1/files/upload_session/block_append')
            .type('json')
            .set({
                'MiniCloud-API-Arg': JSON.stringify({
                    session_id: sessionId,
                    signature: '1234'
                })
            })
            .expect(401)
            .end()
        res.body.error.should.equal('invalid_signature')
        done()
    })
    it(' /files/upload_session/block_append 409', function*(done) {
        var sessionId = '1234'
        var time = new Date().getTime()
        time-=24*60*60+10
        var signature = md5(sessionId + time + global.appContext.safe_code)
        var res = yield request(app)
            .post('/api/v1/files/upload_session/block_append')
            .type('json')
            .set({
                'MiniCloud-API-Arg': JSON.stringify({
                    session_id: sessionId,
                    signature: signature,
                    time:time
                })
            })
            .expect(409)
            .end()
        res.body.error.should.equal('session_timeout')
        done()
    })
    it(' /files/upload_session/block_append 400 check offset', function*(done) {
        var sessionId = '1234'
        var time = new Date().getTime()
        var signature = md5(sessionId + time + global.appContext.safe_code)
        var res = yield request(app)
            .post('/api/v1/files/upload_session/block_append')
            .type('json')
            .set({
                'MiniCloud-API-Arg': JSON.stringify({
                    session_id: sessionId,
                    signature: signature,
                    offset: 'abcd',
                    time: time
                })
            })
            .expect(400)
            .end()
        done()
    })
    it(' /files/upload_session/block_append 200', function*(done) {
        var sessionId = '1234'
        var time = new Date().getTime()
        var signature = md5(sessionId + time + global.appContext.safe_code)
        var rootPath = './test/test-files/merge/a/47/61/8d/22/47618d22b1830e42684579364e62f89000237433'
        var blocks = [{
            offset: 0,
            file_name: '47618d22b1830e42684579364e62f89000237433'
        }, {
            offset: 90,
            file_name: '47618d22b1830e42684579364e62f890002374330001'
        }, {
            offset: 180,
            file_name: '47618d22b1830e42684579364e62f890002374330002'
        }, {
            offset: 270,
            file_name: '47618d22b1830e42684579364e62f890002374330003'
        }, {
            offset: 360,
            file_name: '47618d22b1830e42684579364e62f890002374330004'
        }, {
            offset: 450,
            file_name: '47618d22b1830e42684579364e62f890002374330005'
        }]
        for (var i = 0; i < blocks.length; i++) {
            var blockInfo = blocks[i]
            var blockPath = path.join(rootPath, blockInfo.file_name)
            var res = yield request(app)
                .post('/api/v1/files/upload_session/block_append')
                .set({
                    'MiniCloud-API-Arg': JSON.stringify({
                        session_id: sessionId,
                        signature: signature,
                        offset: blockInfo.offset,
                        time: time
                    })
                })
                .attach('file', blockPath)
                .expect(200)
                .end()
        }
        var res = yield request(app)
            .post('/api/v1/files/upload_session/block_finish')
            .send({
                session_id: sessionId,
                signature: signature,
                time: time
            })
            .expect(200)
            .end()
        res.body.hash.should.equal('47618d22b1830e42684579364e62f89000237433')
        res.body.size.should.equal(452)
            //assert data  
        var filePath = yield fileHelpers.find(global.appContext.path, '47618d22b1830e42684579364e62f89000237433')
        assert(fs.existsSync(filePath), true)
            //assert cache
        var files = yield fsPlus.walk('./cache')
        assert(files.length + 1, 1)
            //assert block
        var files = yield fsPlus.walk('./block')
        assert(files.length + 1, 1)
        done()
    })
    it(' /files/upload_session/block_finish 400', function*(done) {
        yield request(app)
            .post('/api/v1/files/upload_session/block_finish')
            .type('json')
            .expect(400)
            .end()
        done()
    })
    it(' /files/upload_session/block_finish 401', function*(done) {
        var sessionId = '1234'
        var time = new Date().getTime()
        var signature = md5(sessionId + time + global.appContext.safe_code)
        var res = yield request(app)
            .post('/api/v1/files/upload_session/block_finish')
            .type('json')
            .send({
                session_id: sessionId,
                signature: '1234',
                time: time
            })
            .expect(401)
            .end()
        res.body.error.should.equal('invalid_signature')
        done()
    })
    it(' /files/upload_session/block_finish 409', function*(done) {
        var sessionId = '1234'
        var time = new Date().getTime()
        var signature = md5(sessionId + time + global.appContext.safe_code)
        var res = yield request(app)
            .post('/api/v1/files/upload_session/block_finish')
            .type('json')
            .send({
                session_id: sessionId,
                signature: signature,
                time: time
            })
            .expect(409)
            .end()
        res.body.error.should.equal('session_id_not_found')
        done()
    })
    it(' /files/upload_session/block_finish 409 session_timeout', function*(done) {
        var sessionId = '1234'
        var time = new Date().getTime() 
        time-=24*60*60+10 
        var signature = md5(sessionId + time + global.appContext.safe_code)
        var res = yield request(app)
            .post('/api/v1/files/upload_session/block_finish')
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
})
