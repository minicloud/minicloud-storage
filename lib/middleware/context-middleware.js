/**
 * set global variables to request
 *
 * @param {Object} opts 
 * @api public
 */
module.exports = function(opts) {
    return function* miniHost(next) {
        var appContext = global.appContext 
        var miniHost = this.request.header.host 
        this.request.miniHost = 'http://' + miniHost
        this.request.appContext = global.appContext

        yield * next
    }
}
