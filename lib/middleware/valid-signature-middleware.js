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
        var body = this.request.body
        var signature = body.signature
        var sessionId = body.session_id

        if (this.errors) {
            var isOk = false
            //parse from header
            var argStr = this.request.get('MiniCloud-API-Arg')
            if (argStr) {
                var arg = JSON.parse(argStr)
                if (arg.session_id && arg.signature) {
                    signature = arg.signature
                    sessionId = arg.session_id
                    isOk = true
                }
            }
            if (!isOk) {
                webHelpers.throw400(this)
                return
            }

        }
        var appContext = this.request.appContext
        var safeCode = appContext.safe_code        

        if (signature === md5(safeCode + sessionId)) {
            return yield * next
        }
        webHelpers.throw(this, 401, 'invalid_signature', 'The signature provided is invalid.')
    }
}
