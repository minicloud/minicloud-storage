var webHelpers = require('../web-helpers')
    /**
     * validate safe code
     *
     * @param {Object} opts 
     * @api public
     */
module.exports = function(opts) {
    return function* miniHost(next) { 
        var appContext = this.request.appContext
        var safeCode = this.request.get('safeCode')
        var oriSafeCode = appContext.safe_code
        if (safeCode === oriSafeCode) {
            return yield * next
        }
        webHelpers.throw(this, 401, 'invalid_safe_code', 'The safe code provided is invalid.')
    }
}
