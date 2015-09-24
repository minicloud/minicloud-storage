/**
 * Module dependencies.
 */
var webHelpers = require('../../web-helpers')
var fileHelpers = require('../../file-helpers')
var formidable = require('koa-formidable')
var path = require('path')
var cofs = require('co-fs')
var S = require('string')
var algo = require('ape-algorithm')
var uuid = require('uuid')
    /**
     * append file
     * @api private
     */
var append = function*() {
        //get block infomation
        var argStr = this.request.get('MiniCloud-API-Arg')
        var arg = JSON.parse(argStr)
        signature = arg.signature
        sessionId = arg.session_id
        offset = arg.offset
        if (typeof(offset) === 'undefined' || !S(offset).isNumeric()) {
            webHelpers.throw(this, 400, 'Error in call to API function files/upload_session/block_append', 'offset invalidate.')
            return
        }
        //file from socket.io
        var header = this.request.header
        var file = null
        if (!header) {
            //socket.io buffer upload file
            file = this.request.file
        } else {
            //support content-type:multipart/form-data application/octet-stream
            var maxSize = this.request.storeContext.single_file_max_size
            var cacheDir = this.request.storeContext.cache
            var options = {
                maxFieldsSize: maxSize * 1024 * 1024,
                uploadDir: cacheDir
            }
            try {
                var form = yield formidable.parse(options, this)
                file = form.files.file
            } catch (error) {

            }
        }
        if (!file) {
            webHelpers.throw(this, 409, 'empty_block', 'empty block.')
            return
        }
        //save block file to {bolck/session_id}        
        var sessionSavePath = path.join(this.request.storeContext.block, sessionId)
        var blockFileSavePath = path.join(this.request.storeContext.block, sessionId, offset + '')
        var existed = yield cofs.exists(sessionSavePath)
        if (!existed) {
            yield cofs.mkdir(sessionSavePath)
        }
        yield fileHelpers.move(file.path, blockFileSavePath)
        this.body = ''
    }
    /**
     * merge file
     * @param {String} cache
     * @param {String} sessionSavePath
     * @api private
     */
var merge = function*(cache, sessionSavePath) {
        //sort file name 
        var subFiles = yield cofs.readdir(sessionSavePath)
        var offsets = []
        for (var i = 0; i < subFiles.length; i++) {
            var name = subFiles[i]
            offsets.push(parseInt(name))
        }
        offsets = algo.quicksort.sort(offsets)
            //merge to cache file
        var newFilePath = path.join(cache, uuid.v4())
        for (var i = 0; i < offsets.length; i++) {
            var offset = offsets[i]
            var blockFilePath = path.join(sessionSavePath, offset + '')
            yield fileHelpers.merge(newFilePath, blockFilePath)
        }
        //return file hash
        var hash = yield fileHelpers.getFileSha1(newFilePath)
        var stat = yield cofs.stat(newFilePath)
        return {
            hash: hash,
            path: newFilePath,
            size: stat.size
        }
    }
    /**
     * clean cache
     * @param {String} sessionSavePath
     * @api private
     */
var cleanCache = function*(sessionSavePath) {
        //sort file name 
        var subFiles = yield cofs.readdir(sessionSavePath)
        for (var i = 0; i < subFiles.length; i++) {
            var name = subFiles[i]
            var childFilePath = path.join(sessionSavePath, name)
            yield cofs.unlink(childFilePath)
        }
        yield cofs.rmdir(sessionSavePath)
    }
    /**
     * finish block file
     * @api private
     */
var finish = function*() {
    var body = this.request.body
    var sessionId = body.session_id
    var sessionSavePath = path.join(this.request.storeContext.block, sessionId)
    var existed = yield cofs.exists(sessionSavePath)
    if (!existed) {
        webHelpers.throw(this, 409, 'session_id_not_found', 'The session_id not found.')
        return
    }
    //merge
    var fileInfo = yield merge(this.request.storeContext.cache, sessionSavePath)

    var hash = fileInfo.hash
    var dataPath = this.request.storeContext.path
    var oldPath = yield fileHelpers.find(dataPath, hash)
        //file not existed
    if (!oldPath) {
        var newPath = fileHelpers.getFilePath(dataPath, hash)
        yield fileHelpers.move(fileInfo.path, newPath)
    }
    //clean cache
    yield cleanCache(sessionSavePath)
        //return data
    this.body = {
        hash: hash,
        size: fileInfo.size
    }
}
exports.append = append
exports.finish = finish
