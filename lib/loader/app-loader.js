/**
 * Module dependencies.
 */
var responseTime = require('koa-response-time')
var ratelimit = require('koa-ratelimit')
var compress = require('koa-compress')
var logger = require('koa-logger')
var router = require('koa-router')()
var koa = require('koa')
var env = process.env.NODE_ENV || 'development'
var bodyParser = require('koa-bodyparser')
var fsPlus = require('co-fs-plus')
var fs = require('fs')
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
        opts.port = opts.port || 6081
        opts.logs = opts.logs || './logs'
        opts.safe_code = opts.safe_code || 'uBEEAcKM2D7sxpJD7QQEapsxiCmzPCyS'
        opts.single_file_max_size = opts.single_file_max_size || 1024
        opts.cache = opts.cache || './cache'
        opts.block = opts.block || './block'
        opts.path = opts.path || ['./data/a', './data/b', './data/c']
            //create data folder
        var paths = opts.path
        for (var i = 0; i < paths.length; i++) {
            var subPath = paths[i]
            if (!fs.existsSync(subPath)) {
                yield fsPlus.mkdirp(subPath)
            }
        }
        //create cache folder
        if (!fs.existsSync(opts.cache)) {
            yield fsPlus.mkdirp(opts.cache)
        }
        //create block folder
        if (!fs.existsSync(opts.block)) {
            yield fsPlus.mkdirp(opts.block)
        }
        return opts
    }
    /**
     * Return koa app.
     *
     * load all middleware and all routers
     * @param {Object} opts
     * @return {Object}
     * @api public
     */
module.exports = function*(opts) {
    opts = yield initConfig(opts)
    var app = koa()
    global.testModel = env == 'test'
        //init appContext
    global.appContext = opts
        //support cros
    var cors = require('kcors')
    app.use(cors({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
            'Access-Control-Allow-Headers': 'X-Requested-With,content-type',
            'Access-Control-Allow-Credentials': true
        }))
        //support bodyParser
    app.use(bodyParser())
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
    apiLoader(router, __dirname + '/../router')
    return app
}
