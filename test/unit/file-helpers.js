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
        assert.equal(hash, '47618d22b1830e42684579364e62f89000237433')
        done()
    })
    it('find', function*(done) {
        var paths = ['./test/test-files/find/a', './test/test-files/find/b', './test/test-files/find/c']
        var path = yield fileHelpers.find(paths, '47618d22b1830e42684579364e62f89000237433')
        assert.equal(fs.existsSync(path), true)
        done()
    })
    it('merge miniyun v1.5', function*(done) {
        var cachePath = './test/test-files/merge/a/47/61/8d/22/47618d22b1830e42684579364e62f89000237433/new_47618d22b1830e42684579364e62f89000237433'
        if (fs.existsSync(cachePath)) {
            fs.unlinkSync(cachePath)
        }
        var paths = ['./test/test-files/merge/a', './test/test-files/merge/b', './test/test-files/merge/c']
        var path = yield fileHelpers.find(paths, '47618d22b1830e42684579364e62f89000237433')
        assert.equal(fs.existsSync(path), true)
        var hash = yield fileHelpers.getFileSha1(path)
        assert.equal(hash, '47618d22b1830e42684579364e62f89000237433')
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
            assert.equal(!existed, true)
        }
        done()
    })
    it('createThumbnail parse size', function*(done) {
        var fs = require('fs')
        var co = require('co')
        var sourcePath = './test/test-files/test.jpg'
        var aimPath = global.appContext.path[0]+'/abc.jpg'
        var readStream = fs.createReadStream(sourcePath)
        var writeFile = fs.createWriteStream(aimPath)
        readStream.pipe(writeFile)
        readStream.on("end", function() {
            co.wrap(function*() {
                var thumbnailPath = yield fileHelpers.createThumbnail(aimPath, 'abc.png', '256')
                var pos = thumbnailPath.indexOf('256x256')
                assert.equal(pos > 1, true)
                var thumbnailPath = yield fileHelpers.createThumbnail(aimPath, 'abc.png', 'hac')
                var pos = thumbnailPath.indexOf('256x256')
                assert.equal(pos > 1, true)
                var thumbnailPath = yield fileHelpers.createThumbnail(aimPath, 'abc.png', '1h32')
                var pos = thumbnailPath.indexOf('256x256')
                assert.equal(pos > 1, true)
                var thumbnailPath = yield fileHelpers.createThumbnail(aimPath, 'abc.png', 'wah32')
                var pos = thumbnailPath.indexOf('256x256')
                assert.equal(pos > 1, true)
                var thumbnailPath = yield fileHelpers.createThumbnail(aimPath, 'abc.png', 'w32h32')
                var pos = thumbnailPath.indexOf('32x32')
                assert.equal(pos > 1, true)
                done()
            })()
        })
    })
    it('createThumbnail ai', function*(done) {
        //ok
        var fs = require('fs')
        var co = require('co')
        var path = require('path')
        var sourcePath = './test/test-image/test.ai'
        var aimPath = global.appContext.path[0] + path.basename(sourcePath)
        var readStream = fs.createReadStream(sourcePath)
        var writeFile = fs.createWriteStream(aimPath)
        readStream.pipe(writeFile)
        readStream.on("end", function() {
            co.wrap(function*() {
                var thumbnailPath = yield fileHelpers.createThumbnail(aimPath, path.basename(aimPath), 'w256h256')
                var pos = thumbnailPath.indexOf('256x256')
                assert.equal(pos > 1, true)
                done()
            })()
        })
    })
    it('createThumbnail psd', function*(done) {
        //ok
        var fs = require('fs')
        var co = require('co')
        var path = require('path')
        var sourcePath = './test/test-image/test.psd'
        var aimPath = global.appContext.path[0] + path.basename(sourcePath)
        var readStream = fs.createReadStream(sourcePath)
        var writeFile = fs.createWriteStream(aimPath)
        readStream.pipe(writeFile)
        readStream.on("end", function() {
            co.wrap(function*() {
                var thumbnailPath = yield fileHelpers.createThumbnail(aimPath, path.basename(aimPath), 'w256h256')
                var pos = thumbnailPath.indexOf('256x256')
                assert.equal(pos > 1, true)
                done()
            })()
        })
    })
    it('createThumbnail jpg', function*(done) {
        //ok
        var fs = require('fs')
        var co = require('co')
        var path = require('path')
        var sourcePath = './test/test-image/test.jpg'
        var aimPath = global.appContext.path[0] + path.basename(sourcePath)
        var readStream = fs.createReadStream(sourcePath)
        var writeFile = fs.createWriteStream(aimPath)
        readStream.pipe(writeFile)
        readStream.on("end", function() {
            co.wrap(function*() {
                var thumbnailPath = yield fileHelpers.createThumbnail(aimPath, path.basename(aimPath), 'w256h256')
                var pos = thumbnailPath.indexOf('256x256')
                assert.equal(pos > 1, true)
                done()
            })()
        })
    })
    it('createThumbnail gif', function*(done) {
        //ok
        var fs = require('fs')
        var co = require('co')
        var path = require('path')
        var sourcePath = './test/test-image/test.gif'
        var aimPath = global.appContext.path[0] + path.basename(sourcePath)
        var readStream = fs.createReadStream(sourcePath)
        var writeFile = fs.createWriteStream(aimPath)
        readStream.pipe(writeFile)
        readStream.on("end", function() {
            co.wrap(function*() {
                var thumbnailPath = yield fileHelpers.createThumbnail(aimPath, path.basename(aimPath), 'w256h256')
                var pos = thumbnailPath.indexOf('256x256')
                assert.equal(pos > 1, true)
                done()
            })()
        })
    })
    it('createThumbnail bmp', function*(done) {
            //ok
            var fs = require('fs')
            var co = require('co')
            var path = require('path')
            var sourcePath = './test/test-image/test.bmp'
            var aimPath = global.appContext.path[0] + path.basename(sourcePath)
            var readStream = fs.createReadStream(sourcePath)
            var writeFile = fs.createWriteStream(aimPath)
            readStream.pipe(writeFile)
            readStream.on("end", function() {
                co.wrap(function*() {
                    var thumbnailPath = yield fileHelpers.createThumbnail(aimPath, path.basename(aimPath), 'w256h256')
                    var pos = thumbnailPath.indexOf('256x256')
                    assert.equal(pos > 1, true)
                    done()
                })()
            })
        })
        // it('createThumbnail cdr', function*(done) {
        //         var fs = require('fs')
        //         var co = require('co')
        //         var path = require('path')
        //         var sourcePath = './test/test-image/test.cdr'
        //         var aimPath = './data/' + path.basename(sourcePath)
        //         var readStream = fs.createReadStream(sourcePath)
        //         var writeFile = fs.createWriteStream(aimPath)
        //         readStream.pipe(writeFile)
        //         readStream.on("end", function() {
        //             co.wrap(function*() {
        //                 var thumbnailPath = yield fileHelpers.createThumbnail(aimPath, path.basename(aimPath), 'w256h256')
        //                 var pos = thumbnailPath.indexOf('256x256')
        //                 assert.equal(pos > 1, true)
        //                 done()
        //             })()
        //         })
        //     })
    it('createThumbnail eps', function*(done) {
        //ok
        var fs = require('fs')
        var co = require('co')
        var path = require('path')
        var sourcePath = './test/test-image/test.eps'
        var aimPath = global.appContext.path[0] + path.basename(sourcePath)
        var readStream = fs.createReadStream(sourcePath)
        var writeFile = fs.createWriteStream(aimPath)
        readStream.pipe(writeFile)
        readStream.on("end", function() {
            co.wrap(function*() {
                var thumbnailPath = yield fileHelpers.createThumbnail(aimPath, path.basename(aimPath), 'w256h256')
                var pos = thumbnailPath.indexOf('256x256')
                assert.equal(pos > 1, true)
                done()
            })()
        })
    })
    it('createThumbnail tif', function*(done) {
        //ok
        var fs = require('fs')
        var co = require('co')
        var path = require('path')
        var sourcePath = './test/test-image/test.tif'
        var aimPath = global.appContext.path[0] + path.basename(sourcePath)
        var readStream = fs.createReadStream(sourcePath)
        var writeFile = fs.createWriteStream(aimPath)
        readStream.pipe(writeFile)
        readStream.on("end", function() {
            co.wrap(function*() {
                var thumbnailPath = yield fileHelpers.createThumbnail(aimPath, path.basename(aimPath), 'w256h256')
                var pos = thumbnailPath.indexOf('256x256')
                assert.equal(pos > 1, true)
                done()
            })()
        })
    })
    it('createThumbnail png', function*(done) {
        //ok
        var fs = require('fs')
        var co = require('co')
        var path = require('path')
        var sourcePath = './test/test-image/test.png'
        var aimPath = global.appContext.path[0] + path.basename(sourcePath)
        var readStream = fs.createReadStream(sourcePath)
        var writeFile = fs.createWriteStream(aimPath)
        readStream.pipe(writeFile)
        readStream.on("end", function() {
            co.wrap(function*() {
                var thumbnailPath = yield fileHelpers.createThumbnail(aimPath, path.basename(aimPath), 'w256h256')
                var pos = thumbnailPath.indexOf('256x256')
                assert.equal(pos > 1, true)
                done()
            })()
        })
    })
})
