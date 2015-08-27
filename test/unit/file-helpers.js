var request = require('co-supertest')
var context = require('../context')
var assert = require('assert')
var fs = require('fs')
describe(' file-helpers.js', function() {
    this.timeout(10000)
    var app = null
    var fileHelpers = null
    before(function*(done) {
        app = yield context.getApp()
        fileHelpers = require('../../lib/file-helpers')
        return done()
    })
    it('getFileSha1', function*(done) {
        var hash = yield fileHelpers.getFileSha1('./test/test-files/lt-1k.js')
        assert(hash, '47618d22b1830e42684579364e62f89000237433')
        done()
    })
    it('find', function*(done) {
        var paths = ['./test/test-files/find/a', './test/test-files/find/b', './test/test-files/find/c']
        var path = yield fileHelpers.find(paths, '47618d22b1830e42684579364e62f89000237433')
        assert(fs.existsSync(path), true)
        done()
    })
    it('merge miniyun v1.5', function*(done) {
        var cachePath = './test/test-files/merge/a/47/61/8d/22/47618d22b1830e42684579364e62f89000237433/new_47618d22b1830e42684579364e62f89000237433'
        if (fs.existsSync(cachePath)) {
            fs.unlinkSync(cachePath)
        }
        var paths = ['./test/test-files/merge/a', './test/test-files/merge/b', './test/test-files/merge/c']
        var path = yield fileHelpers.find(paths, '47618d22b1830e42684579364e62f89000237433')
        assert(fs.existsSync(path), true)
        var hash = yield fileHelpers.getFileSha1(path)
        assert(hash, '47618d22b1830e42684579364e62f89000237433')
        if (fs.existsSync(cachePath)) {
            fs.unlinkSync(cachePath)
        }
        done()
    })
    it('getFilePath', function*(done) {
        var paths = ['./test/test-files/merge/a', './test/test-files/merge/b', './test/test-files/merge/c']
        var oldPath = yield fileHelpers.find(paths, '57618d22b1830e42684579364e62f89000237433')
        if (!oldPath) {
            var newPath = fileHelpers.getFilePath(paths, '57618d22b1830e42684579364e62f89000237433')
            var existed = fs.existsSync(newPath)
            assert(!existed, true) 
        }
        done()
    })
})
