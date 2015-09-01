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
describe(' files/upload_session/send', function() {
    this.timeout(10000)
    var app = null
    before(function*(done) {
        app = yield context.getApp()
        deleteFolder('./cache')
        deleteFolder('./data')
        yield fsPlus.mkdirp('./cache')
        yield fsPlus.mkdirp('./data')
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
        var sessionId = '1234'
        var res = yield request(app)
            .post('/api/v1/files/upload_session/send')
            .type('json')
            .set({
                'MiniCloud-API-Arg': JSON.stringify({
                    session_id: sessionId,
                    signature: '1234567'
                })
            })
            .expect(401)
            .end()
        res.body.error.should.equal('invalid_signature')
        done()
    })
    it(' /files/upload_session/send 200', function*(done) {
        var sessionId = '1234'
        var signature = md5(global.appContext.safe_code + sessionId)
        var res = yield request(app)
            .post('/api/v1/files/upload_session/send')
            .set({
                'MiniCloud-API-Arg': JSON.stringify({
                    session_id: sessionId,
                    signature: signature
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

})
