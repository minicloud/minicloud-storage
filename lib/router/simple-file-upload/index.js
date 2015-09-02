/**
 * Module dependencies.
 */
var webHelpers = require('../../web-helpers')
var fileHelpers = require('../../file-helpers')
var formidable = require('koa-formidable')
    /**
     * upload file
     * @api public
     */
var send = function*() {
    var file = this.request.file
    var hash = null
        //socket.io buffer upload file
    if (file) {
        hash = yield fileHelpers.getFileSha1(file.path)
    } else {
        //http form 
        var maxSize = this.request.appContext.single_file_max_size
        var cacheDir = this.request.appContext.cache
        var options = {
            maxFieldsSize: maxSize * 1024 * 1024,
            hash: 'sha1',
            uploadDir: cacheDir
        }
        var form = yield formidable.parse(options, this)
        file = form.files.file
        hash = file.hash
    }
    var dataPath = this.request.appContext.path
    var oldPath = yield fileHelpers.find(dataPath, hash)
        //hash not existed
    if (!oldPath) {
        var newPath = fileHelpers.getFilePath(dataPath, hash)
        yield fileHelpers.move(file.path, newPath)
    } 
    this.body = {
        hash: hash,
        size: file.size
    }
} 
exports.send = send
