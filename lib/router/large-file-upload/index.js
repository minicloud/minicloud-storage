/**
 * Module dependencies.
 */
var webHelpers = require('../../web-helpers')
var fileHelpers = require('../../file-helpers')
var formidable = require('koa-formidable')
var path = require('path')
var fs = require('fs')
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
        var maxSize = this.request.appContext.single_file_max_size
        var cacheDir = this.request.appContext.cache
        var options = {
            maxFieldsSize: maxSize * 1024 * 1024,
            uploadDir: cacheDir
        }
        var form = yield formidable.parse(options, this)
        var file = form.files.file
            //save block file to {bolck/session_id}        
        var sessionSavePath = path.join(this.request.appContext.block, sessionId)
        var blockFileSavePath = path.join(this.request.appContext.block, sessionId, offset + '')
        if (!fs.existsSync(sessionSavePath)) {
            fs.mkdirSync(sessionSavePath)
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
        var subFiles = fs.readdirSync(sessionSavePath)
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
        return {
            hash: hash,
            path: newFilePath,
            size: fs.statSync(newFilePath).size
        }
    }
    /**
     * clean cache
     * @param {String} sessionSavePath
     * @api private
     */
var cleanCache = function(sessionSavePath) {
        //sort file name 
        var subFiles = fs.readdirSync(sessionSavePath)
        for (var i = 0; i < subFiles.length; i++) {
            var name = subFiles[i]
            var childFilePath = path.join(sessionSavePath, name)
            fs.unlinkSync(childFilePath)
        }
        fs.rmdirSync(sessionSavePath)
    }
    /**
     * finish block file
     * @api private
     */
var finish = function*() {
    var body = this.request.body
    var sessionId = body.session_id
    var sessionSavePath = path.join(this.request.appContext.block, sessionId)
    if (!fs.existsSync(sessionSavePath)) {
        webHelpers.throw(this, 409, 'session_id_not_found', 'The session_id not found.')
        return
    }
    //merge
    var fileInfo = yield merge(this.request.appContext.cache, sessionSavePath)
    var hash = fileInfo.hash
    var dataPath = this.request.appContext.path
    var oldPath = yield fileHelpers.find(dataPath, hash)
        //file not existed
    if (!oldPath) {
        var newPath = fileHelpers.getFilePath(dataPath, hash)
        yield fileHelpers.move(fileInfo.path, newPath)
    }
    //clean cache
    cleanCache(sessionSavePath)
        //return data
    this.body = {
        hash: hash,
        size: fileInfo.size
    }
}
exports.append = append
exports.finish = finish
