/**
 * Module dependencies.
 */
var fileHelpers = require('../../file-helpers')
var webHelpers = require('../../web-helpers')
var contentDisposition = require('content-disposition')
var fs = require('mz/fs')
var mime = require('mime')
    /**
     * download file
     * @api public
     */
exports.download = function*() {
    var body = this.request.query
    var hash = body.hash
    var name = decodeURIComponent(body.name)
    body.online_view = body.online_view || '0'
    var isDownload = body.online_view==='0'?true:false

    var dataPath = this.request.appContext.path
    var filePath = yield fileHelpers.find(dataPath, hash)
    if (!filePath) {
        webHelpers.throw(this, 409, 'hash_not_exist', 'hash not exist.')
        return
    }
    var stats = yield fs.stat(filePath)
    this.res.setHeader('Content-Type', mime.lookup(name))
    if (isDownload) {
        this.res.setHeader('Content-Disposition', contentDisposition(name))
    }
    this.res.setHeader('Last-Modified', stats.mtime.toUTCString())
    this.res.setHeader('Content-Length', stats.size)
    this.body = fs.createReadStream(filePath)
}
