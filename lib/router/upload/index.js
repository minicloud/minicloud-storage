/**
 * Module dependencies.
 */
var fs = require('fs')
var webHelpers = require('../../web-helpers')
var fileHelpers = require('../../file-helpers')
var formidable = require('koa-formidable')
    /**
     * upload file
     * @api public
     */
exports.upload = function*() {
    var dataPath = this.request.appContext.path
    var maxSize = this.request.appContext.single_file_max_size
    var cacheDir = this.request.appContext.cache
    var options = {
        maxFieldsSize: maxSize * 1024 * 1024,
        hash: 'sha1',
        uploadDir: cacheDir
    }
    var form = yield formidable.parse(options, this)
    var file = form.files.file 
    var hash = file.hash
    var oldPath = yield fileHelpers.find(dataPath, hash)
        //file not existed
    if (!oldPath) {
        var newPath = fileHelpers.getFilePath(dataPath, hash)
        yield fileHelpers.move(file.path, newPath)
    }
    this.body = ''
}
