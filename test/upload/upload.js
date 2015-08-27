var request = require('co-supertest')
var fs = require('fs')
var fsPlus = require('co-fs-plus')
var context = require('../context')
var fileHelpers = require('../../lib/file-helpers')
var assert = require('assert')
var path = require('path')
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
describe(' files/upload', function() {
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
    it(' /files/upload 401', function*(done) {
        yield request(app)
            .post('/api/v1/files/upload')
            .attach('file', './test/test-files/lt-1k.js')
            .expect(200)
            .end()
            //assert data 
        var path = yield fileHelpers.find(global.appContext.path, '47618d22b1830e42684579364e62f89000237433')
        assert(fs.existsSync(path), true)
            //assert cache
        var files = yield fsPlus.walk('./cache')
        assert(files.length + 1, 1)
        done()
    })

})
