var request = require('co-supertest')
var fs = require('fs')
var fsPlus = require('co-fs-plus')
var context = require('../context')
var fileHelpers = require('../../lib/file-helpers')
var assert = require('assert')
describe(' files/upload', function() {
    this.timeout(10000)
    var app = null
    before(function*(done) {
        app = yield context.getApp()
        fileHelpers.deleteFolder('./cache')
        fileHelpers.deleteFolder('./data')
        yield fsPlus.mkdirp('./cache')
        yield fsPlus.mkdirp('./data')
        return done()
    })
    it(' /files/upload 401', function*(done) {
        yield request(app)
            .post('/api/v1/files/upload')
            .attach('file', './test/test-files/lt-1k.js')
            .expect(200)
            .end()
        //assert data 
        var path = yield fileHelpers.find(global.appContext.path,'47618d22b1830e42684579364e62f89000237433')
        assert(fs.existsSync(path),true)
        //assert cache
        var files = yield fsPlus.walk('./cache') 
        assert(files.length+1,1)
        done()
    })

})
