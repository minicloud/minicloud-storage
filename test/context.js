process.setMaxListeners(0)
var client = require('./socket-io-client')
var initSocketClient = function(app) {
        return function(done) {
            var socket = client(app)
            socket.on('connect', function() {
                done(null, socket)
            })
        }
    }
    /**
     * Return test App
     * @return {Koa}
     * @api public
     */
exports.getApp = function*() {
    if (!global.app) {
        var app = yield require('../lib/loader/app-loader')() 
        global.app = app.listen()
        global.socket = yield initSocketClient(app)
    }
    return global.app
}
