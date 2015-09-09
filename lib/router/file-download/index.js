/**
 * Module dependencies.
 */
var fileHelpers = require('../../file-helpers')
var webHelpers = require('../../web-helpers')
    /**
     * download file
     * @api public
     */
exports.download = function*() {
    var body = this.request.query
    var hash = body.hash
    var name = body.name
    var onlineView = body.online_view || 0
    var dataPath = this.request.appContext.path
    var filePath = yield fileHelpers.find(dataPath, hash)
    if (!filePath) {
        webHelpers.throw(this, 409, 'hash_not_exist', 'hash not exist.')
        return
    }
    this.body = ''
}
