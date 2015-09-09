var crypto = require('crypto')
var cofs = require('co-fs')
var fs = require('fs')
var fsPlus = require('co-fs-plus')
var path = require('path')
var co = require('co')
var path = require('path')
var im = require('imagemagick')
    /**
     * return random number
     * @param {Integer} Min 
     * @param {Integer} Max 
     * @return {Integer}
     * @api private
     */
var _getRandomNum = function(Min, Max) {
        var Range = Max - Min
        var Rand = Math.random()
        return (Min + Math.round(Rand * Range))
    }
    /**
     * block path append to aimPath 
     * @param {Array} zonePathList 
     * @param {String} signature 
     * @return {String}
     * @api private
     */
var merge = function(aimPath, blockPath) {
        return function(done) {
            var writeStream = fs.createWriteStream(aimPath, {
                'flags': 'a'
            })
            var readStream = fs.createReadStream(blockPath)
            readStream.pipe(writeStream)
            readStream.on('end', function() {
                return done(null, true)
            })
        }
    }
    /**
     * return file save path
     * @param {Array} pathList 
     * @param {String} signature 
     * @return {String}
     * @api private
     */
var getFilePath = function(pathList, signature) {
        var pos = _getRandomNum(0, pathList.length - 1)
        var subPath = pathList[pos]
        return _getFileContentPath(subPath, signature)
    }
    /**
     * find signature file
     * @param {Array} zonePathList 
     * @param {String} signature 
     * @return {String}
     * @api private
     */
var find = function*(zonePathList, signature) {
        for (var i = 0; i < zonePathList.length; i++) {
            var rootPath = zonePathList[i]
            var maybePath = _getFileContentPath(rootPath, signature)
            if (yield cofs.exists(maybePath)) {
                //Compatible miniyun 1.5
                var stat = yield cofs.stat(maybePath)
                if (stat.isDirectory()) {
                    var newFilePath = path.join(maybePath, 'new_' + signature)
                    var exists = yield cofs.exists(newFilePath)
                    if (!exists) {
                        //merge subfiles to newFilePath
                        var subFiles = yield cofs.readdir(maybePath)
                        for (var j = 0; j < subFiles.length; j++) {
                            var blockFileName = subFiles[j]
                            if (blockFileName.indexOf(signature) === 0) {
                                var blockFilePath = path.join(maybePath, blockFileName)
                                yield merge(newFilePath, blockFilePath)
                            }
                        }
                    }
                    return newFilePath
                }
                return maybePath
            }
        }
        return false
    }
    /**
     * return file save path
     * @param {String} rootPath 
     * @param {String} signature 
     * @return {String}
     * @api private
     */
var _getFileContentPath = function(rootPath, signature) {
        var sub1 = signature.substring(0, 2)
        var sub2 = signature.substring(2, 4)
        var sub3 = signature.substring(4, 6)
        var sub4 = signature.substring(6, 8)
        return path.join(rootPath, sub1, sub2, sub3, sub4, signature)
    }
    /**
     * return file content sha1
     * @param {String} filePath  
     * @return {String}
     * @api private
     */
var getFileSha1 = function(filePath) {
        return function(done) {
            var shasum = crypto.createHash('sha1')
            var stream = fs.ReadStream(filePath)
            stream.on('data', function(d) {
                shasum.update(d)
            })
            stream.on('end', function() {
                var signature = shasum.digest('hex')
                return done(null, signature)
            })
        }
    }
    /**
     * move file
     * @param {String} sourcePath
     * @param {String} aimPath   
     * @return {Boolean}
     * @api private
     */
var move = function(sourcePath, aimPath) {
        return function(done) {
            co.wrap(function*() {
                //create parent folder
                var parentPath = path.dirname(aimPath)
                var exists = yield cofs.exists(parentPath)
                if (!exists) {
                    yield fsPlus.mkdirp(parentPath)
                }
                var readStream = fs.createReadStream(sourcePath)
                var writeFile = fs.createWriteStream(aimPath)
                readStream.pipe(writeFile)
                readStream.on("end", function() {
                    co.wrap(function*() {
                        yield cofs.unlink(sourcePath)
                        return done(null, true)
                    })()
                })
            })()

        }
    }
    /**
     * create thumbnail
     * @param {String} sourcePath
     * @param {String} name  
     * @param {String} sizeStr   
     * @return {String}
     * @api private
     */
var createThumbnail = function(sourcePath, name, sizeStr) {
        var size = _parseSize(sizeStr)
        return function(done) {
            var extname = path.extname(name)
            var aimPath = sourcePath + '-' + size.w + 'x' + size.h + extname
            if (fs.existsSync(aimPath)) {
                return done(null, aimPath)
            } else {
                im.convert([sourcePath, '-resize', size.w + 'x' + size.h, aimPath],
                    function(err, stdout) { 
                        done(null,aimPath)
                    })
            }

        }
    }
    /**
     * convert 'w32h32'->{w:32,h:32}
     * @param {String} sourcePath
     * @param {String} name 
     * @param {String} sizeStr   
     * @return {Boolean}
     * @api private
     */
var _parseSize = function(sizeStr) {
    var S = require('string')
    sizeStr = sizeStr || 'w256h256'
    var defaultSize = {
        w: 256,
        h: 256
    }
    sizeStr = sizeStr.toLowerCase()
    var info = sizeStr.split('h')
    if (info.length !== 2) {
        return defaultSize
    }
    var h = info[1]
    if (!S(h).isNumeric()) {
        return defaultSize
    }
    var w = info[0]
    if (w.length === 1) {
        return defaultSize
    }
    w = w.substring(1, w.length)
    if (!S(w).isNumeric()) {
        return defaultSize
    }
    return {
        w: parseInt(w),
        h: parseInt(h)
    }
}
exports.getFileSha1 = getFileSha1
exports.find = find
exports.move = move
exports.merge = merge
exports.getFilePath = getFilePath
exports.createThumbnail = createThumbnail
