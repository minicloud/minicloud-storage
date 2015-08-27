process.setMaxListeners(0)
/**
 * Return test App
 * @return {Koa}
 * @api public
 */
exports.getApp = function*() {
    if (!global.app) {
        var app = yield require('../lib/loader/app-loader')()
        global.app = app.listen()
    }
    return global.app
}
