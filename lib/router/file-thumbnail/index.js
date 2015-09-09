/**
 * Module dependencies.
 */
var fileHelpers = require('../../file-helpers')
var webHelpers = require('../../web-helpers')
    /**
     * return thumbnail
     * @api public
     */
exports.thumbnail = function*() {
    var body = this.request.query
    var hash = body.hash
    var name = body.name
    var size = body.size || 'w256h256'
    var dataPath = this.request.appContext.path
    var filePath = yield fileHelpers.find(dataPath, hash)
    if (!filePath) {
        webHelpers.throw(this, 409, 'hash_not_exist', 'hash not exist.')
        return
    }
    this.body = ''
}
