/**
 * Module dependencies.
 */
var fileHelpers = require('../../file-helpers')
var webHelpers = require('../../web-helpers')
var fs = require('mz/fs')
var mime = require('mime')
    /**
     * return thumbnail
     * @api public
     */
exports.thumbnail = function*() {
    var body = this.request.query
    var hash = body.hash
    var name = body.name
    var size = body.size || 'w256h256'
    var dataPath = this.request.storeContext.path
    var filePath = yield fileHelpers.find(dataPath, hash)
    if (!filePath) {
        webHelpers.throw(this, 409, 'hash_not_exist', 'hash not exist.')
        return
    }
    //parse size 
    var thumbnailPath = yield fileHelpers.createThumbnail(filePath, name, size)
    var stats = yield fs.stat(thumbnailPath)
    this.res.setHeader('Content-Type', mime.lookup(name))
    this.res.setHeader('Last-Modified', stats.mtime.toUTCString())
    this.res.setHeader('Content-Length', stats.size)
    this.body = fs.createReadStream(thumbnailPath)
}
