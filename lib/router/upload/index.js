/**
 * Module dependencies.
 */
var fs = require('fs')
var webHelpers = require('../../web-helpers')
var formidable = require('koa-formidable')
    /**
     * upload file
     * @api public
     */
exports.upload = function*() {

    var maxSize = this.request.appContext.single_file_max_size
    var cacheDir = this.request.appContext.cache
    var options = {
        maxFieldsSize: maxSize * 1024 * 1024,
        hash: 'sha1',
        uploadDir: cacheDir
    }
    var form = yield formidable.parse(options, this)
    this.body = ''
}
