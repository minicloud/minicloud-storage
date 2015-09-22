/**
 * Module dependencies.
 */
var responseTime = require('koa-response-time')
var ratelimit = require('koa-ratelimit')
var compress = require('koa-compress')
var logger = require('koa-logger')
var storagRouter = require('koa-router')
var koa = require('minicloud-koa.io')
var env = process.env.NODE_ENV || 'development'
var fsPlus = require('co-fs-plus')
var cofs = require('co-fs')
var cors = require('kcors')
var optionHelper = require('../option-helpers')
    /**
     * Return init app config.
     * 
     * @param {Object} opts
     * @return {Object}
     * @api private
     */
var initConfig = function*(opts) {
        //set default config
        opts = opts || {}
        opts.port = opts.port || 8031
        opts.logs = opts.logs || './logs'
        opts.safe_code = opts.safe_code || 'uBEEAcKM2D7sxpJD7QQEapsxiCmzPCyS'
        opts.single_file_max_size = optionHelper.getSingleFileMaxSize(opts)
        opts.session_timeout = optionHelper.getSessionTimeout(opts)
        opts.cache = opts.cache_path || './upload_files/cache'
        opts.path = opts.storage_path || ['./upload_files/a', './upload_files/b', './upload_files/c']
        opts.block = opts.cache + '/block'
            //create data folder
        var paths = opts.path
        for (var i = 0; i < paths.length; i++) {
            var subPath = paths[i]
            var existed = yield cofs.exists(subPath)
            if (!existed) {
                yield fsPlus.mkdirp(subPath)
            }
        }
        //create cache folder
        var existed = yield cofs.exists(opts.cache)
        if (!existed) {
            yield fsPlus.mkdirp(opts.cache)
        }
        //create block folder
        existed = yield cofs.exists(opts.block)
        if (!existed) {
            yield fsPlus.mkdirp(opts.block)
        }
        return opts
    }
    /**
     * Return koa app.
     *
     * load all middleware and all routers
     * @param {Object} app
     * @param {Object} router
     * @param {Object} opts
     * @return {Object}
     * @api public
     */
module.exports = function*(app, opts) {
    opts = yield initConfig(opts)
    router = storagRouter()
    var app = app || koa()
    global.testModel = env == 'test'
        //init appContext
    global.appContext = opts
        //support cros    
    app.use(cors({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
            'Access-Control-Allow-Headers': 'X-Requested-With,content-type',
            'Access-Control-Allow-Credentials': true
        }))
        //minicloud middlewares    
    var contextMiddleware = require('../middleware/context-middleware')
    app.use(contextMiddleware())
        // logging
    app.use(logger())
        // x-response-time
    app.use(responseTime())
        // compression
    app.use(compress())
        // routing 
    app.use(router.routes())
        .use(router.allowedMethods())
        //load router
    var apiLoader = require('./router-loader')
    apiLoader(app, router, __dirname + '/../router')
    return app
}
