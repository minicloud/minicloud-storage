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
/**
 * Return koa app.
 *
 * load all middleware and all routers
 * @param {Object} opts
 * @return {Object}
 * @api public
 */
module.exports = function*(opts) {
    var app = koa()
    global.testModel = env == 'test'
        //init appContext
    global.appContext = opts
        //support cros
    var cors = require('kcors')
    app.use(cors())
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
