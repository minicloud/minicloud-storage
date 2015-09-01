var request = require('co-supertest')
var fs = require('fs')
var fsPlus = require('co-fs-plus')
var context = require('../context')
var fileHelpers = require('../../lib/file-helpers')
var assert = require('assert')
var path = require('path')
var md5 = require('md5')
    /**
     * delete folder
     * @param {String} sourcePath
     * @param {String} aimPath   
     * @return {Boolean}
     * @api private
     */
var deleteFolder = function(filePath) {
    var files = []
    if (fs.existsSync(filePath)) {
        files = fs.readdirSync(filePath)
        files.forEach(function(file, index) {
            var curPath = path.join(filePath, file)
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolder(curPath)
            } else { // delete file
                fs.unlinkSync(curPath)
            }
        })
        fs.rmdirSync(filePath)
    }
}
describe(' files/upload_session/block_append', function() {
    this.timeout(10000)
    var app = null
    before(function*(done) {
        app = yield context.getApp()
        deleteFolder('./cache')
        deleteFolder('./data')
        deleteFolder('./block')
        yield fsPlus.mkdirp('./cache')
        yield fsPlus.mkdirp('./data')
        yield fsPlus.mkdirp('./block')
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
    it(' /files/upload_session/block_append 400 check offset', function*(done) {
        var sessionId = '1234'
        var signature = md5(global.appContext.safe_code + sessionId)
        var res = yield request(app)
            .post('/api/v1/files/upload_session/block_append')
            .type('json')
            .set({
                'MiniCloud-API-Arg': JSON.stringify({
                    session_id: sessionId,
                    signature: signature,
                    offset: 'abcd'
                })
            })
            .expect(400)
            .end()
        done()
    })
    it(' /files/upload_session/block_append 200', function*(done) {
        var sessionId = '1234'
        var signature = md5(global.appContext.safe_code + sessionId)
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
                        offset: blockInfo.offset
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
                signature: signature
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
        var res = yield request(app)
            .post('/api/v1/files/upload_session/block_finish')
            .type('json')
            .send({
                session_id: sessionId,
                signature: '1234'
            })
            .expect(401)
            .end()
        res.body.error.should.equal('invalid_signature')
        done()
    })
    it(' /files/upload_session/block_finish 409', function*(done) {
        var sessionId = '1234'
        var signature = md5(global.appContext.safe_code + sessionId)
        var res = yield request(app)
            .post('/api/v1/files/upload_session/block_finish')
            .type('json')
            .send({
                session_id: sessionId,
                signature: signature
            })
            .expect(409)
            .end()
        res.body.error.should.equal('session_id_not_found')
        done()
    })
})