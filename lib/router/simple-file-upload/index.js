/**
 * Module dependencies.
 */
var webHelpers = require('../../web-helpers')
var fileHelpers = require('../../file-helpers')
var formidable = require('koa-formidable')
var cofs = require('co-fs')
    /**
     * upload file
     * @api public
     */
var send = function*() {
    var header = this.request.header
    var hash = null
    var file = null
    if (!header) {
        //socket.io buffer upload file
        file = this.request.file 
        if (file) {
            hash = yield fileHelpers.getFileSha1(file.path)
        }
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
            if (file) {
                hash = yield fileHelpers.getFileSha1(file.path)
            }
        } catch (error) { 
            
        }
    }
    if (!file) {
        webHelpers.throw(this, 409, 'empty_file', 'empty file.')
        return
    }
    var dataPath = this.request.storeContext.path
    var oldPath = yield fileHelpers.find(dataPath, hash)
        //hash not existed
    if (!oldPath) {
        var newPath = fileHelpers.getFilePath(dataPath, hash)
        yield fileHelpers.move(file.path, newPath)
    }else{
        //remove cache
        yield cofs.unlink(file.path)
    }
    this.body = {
        hash: hash,
        size: file.size
    }
}
exports.send = send
