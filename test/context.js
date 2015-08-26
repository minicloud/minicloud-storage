var appConfig = require('../config.json')
var isTravis = Boolean(process.env.CI)
var config = appConfig[process.env.NODE_ENV]
process.setMaxListeners(0)
if (isTravis) {
    config = appConfig['travis-ci']
}
/**
 * Return test App
 * @return {Koa}
 * @api public
 */
exports.getApp = function*() {
    if (!global.app) {
        var app = yield require('../lib/loader/app-loader')(config)
        global.app = app.listen()
    }
    return global.app

}
