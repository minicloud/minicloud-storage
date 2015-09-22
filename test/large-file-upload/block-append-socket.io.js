var request = require('co-supertest')
var fs = require('fs')
var fsPlus = require('co-fs-plus')
var context = require('../context')
var fileHelpers = require('../../lib/file-helpers')
var assert = require('assert')
var path = require('path')
var md5 = require('md5')
 
var uploadBlock = function(blockInfo) {
    var sessionId = '1234'
    var time = new Date().getTime()
    var signature = md5(sessionId + time + global.appContext.safe_code)
    var fs = require('fs')
    var rootPath = './test/test-files/merge/a/47/61/8d/22/47618d22b1830e42684579364e62f89000237433'
    var blockPath = path.join(rootPath, blockInfo.file_name)
    return function(done) {
        fs.readFile(blockPath, function(err, buf) {
            global.socket.emit('/api/v1/files/upload_session/block_append', {
                header: {
                    'MiniCloud-API-Arg': JSON.stringify({
                        session_id: sessionId,
                        signature: signature,
                        offset: blockInfo.offset,
                        time: time
                    })
                },
                buffer: buf
            }, function(body) {
                done(null, null)
            })
        })
    }

}
describe(' files/upload_session/block_append', function() {
    this.timeout(20000)
    var app = null
    before(function*(done) {
        app = yield context.getApp() 
        return done()
    })

    it(' /files/upload_session/block_append socket.io 200', function*(done) {
        var sessionId = '1234'
        var time = new Date().getTime()
        var signature = md5(sessionId + time + global.appContext.safe_code)
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
            yield uploadBlock(blockInfo)
        }
        global.socket.emit('/api/v1/files/upload_session/block_finish', {
            data: {
                session_id: sessionId,
                signature: signature,
                time: time
            }
        }, function(body) {
            var co = require('co')
            co.wrap(function*() {
                body.hash.should.equal('47618d22b1830e42684579364e62f89000237433')
                body.size.should.equal(452)
                    //assert data  
                var filePath = yield fileHelpers.find(global.appContext.path, '47618d22b1830e42684579364e62f89000237433')
                assert(fs.existsSync(filePath), true)
                    //assert cache
                var files = yield fsPlus.walk(global.appContext.cache)
                assert(files.length + 1, 1)
                    //assert block
                var files = yield fsPlus.walk(global.appContext.block)
                assert(files.length + 1, 1)
                done()
            })()

        })

    })
})
