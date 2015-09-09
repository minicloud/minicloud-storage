var webHelpers = require('../web-helpers')
var md5 = require('md5')
    /**
     * validate signature
     *
     * @param {Object} opts 
     * @api public
     */
module.exports = function(opts) {
    return function*(next) {
        this.checkBody('signature').notEmpty('missing required field.')
        this.checkBody('hash').notEmpty('missing required field.')
        this.checkBody('time').notEmpty('missing required field.')
        var body = this.request.query
        var signature = body.signature
        var hash = body.hash
        var time = body.time
        var currentTime = new Date().getTime()
            //timeout
        var diffTime = currentTime - time
        if (diffTime > global.appContext.session_timeout) {
            webHelpers.throw(this, 409, 'session_timeout', 'session timeout.')
            return
        }
        var appContext = this.request.appContext
        var safeCode = appContext.safe_code

        if (signature === md5(hash + time + safeCode)) {
            return yield * next
        }
        webHelpers.throw(this, 401, 'invalid_signature', 'The signature provided is invalid.')
    }
}
