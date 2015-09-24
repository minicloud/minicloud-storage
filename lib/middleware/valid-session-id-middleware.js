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
        this.checkBody('session_id').notEmpty('missing required field.')
        this.checkBody('time').notEmpty('missing required field.')
        var body = this.request.body
        var signature = body.signature
        var sessionId = body.session_id
        var time = body.time
        if (this.errors) {
            var isOk = false
                //parse from header
            var argStr = this.request.get('MiniCloud-API-Arg')
            if (argStr) {
                var arg = JSON.parse(argStr)
                if (arg.session_id && arg.signature) {
                    signature = arg.signature
                    sessionId = arg.session_id
                    time = arg.time
                    isOk = true
                }
            }
            if (!isOk) { 
                webHelpers.throw400(this)
                return
            }

        }
        var currentTime = new Date().getTime()
            //timeout
        var diffTime = currentTime - time
        if (diffTime > global.storeContext.session_timeout) { 
            webHelpers.throw(this, 409, 'session_timeout', 'session timeout.')
            return
        }
        var storeContext = this.request.storeContext
        var safeCode = storeContext.safe_code 
        if (signature === md5(sessionId + time + safeCode)) {
            return yield * next
        }
        
        webHelpers.throw(this, 401, 'invalid_signature', 'The signature provided is invalid.')
    }
}
