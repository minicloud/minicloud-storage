var webHelpers = require('../web-helpers')
    /**
     * set global variables to request
     *
     * @param {Object} opts 
     * @api public
     */
module.exports = function(opts) {
    return function* miniHost(next) {
        var miniHost = this.request.header.host
        this.request.miniHost = 'http://' + miniHost
        this.request.appContext = global.appContext
        var appContext = global.appContext
        var safeCode = this.request.get('safeCode')
        var oriSafeCode = appContext.safe_code
        if (safeCode === oriSafeCode) {
            return yield * next
        }
        webHelpers.throw(this, 401, 'invalid_safe_code', 'The safe code provided is invalid.')
    }
}
