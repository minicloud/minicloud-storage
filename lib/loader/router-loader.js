/**
 * Module dependencies.
 */
var Resource = require('koa-resource-router')
var path = require('path')
var fs = require('fs')
    /**
     * Load resources in `root` directory. * 
     * @param {Object} app
     * @param {Object} router
     * @param {String} root
     * @api public
     */
module.exports = function(app, router, root) {
        fs.readdirSync(root).forEach(function(file) {
            var dir = path.resolve(root, file)
            var stats = fs.lstatSync(dir)
            if (stats.isDirectory()) {
                var conf = require(dir + '/config.json') 
                conf.name = file
                conf.directory = dir
                route(app, router, conf)
            }
        })
    }
    /**
     * parse file from socket.io
     * @param {Object} request 
     * @api private
     */
var parseFileFromSocket = function(request) {
        var uuid = require('uuid')
        var path = require('path')
        var randomAccessFile = require('random-access-file')
        request.path = null
        return function(done) {
            if (request.buffer) {
                var cachePath = path.join(global.appContext.cache, uuid.v4())
                var file = randomAccessFile(cachePath)
                file.write(0, request.buffer, function(err) {
                    var file = {
                        path: cachePath,
                        size: request.buffer.length
                    }
                    done(null, file)
                })
            } else {
                done(null, null)
            }
        }
    }
    /**
     * Define routes in `conf`.
     * @param {Object} app
     * @param {Object} router
     * @param {String} conf
     * @api private
     */

function route(app, router, conf) {

    var mod = require(conf.directory)

    for (var key in conf.routes) {
        var prop = conf.routes[key];
        //var method = key.split(' ')[0];
        var apiPath = key.split(' ')[0];
        //debug('%s %s -> .%s', method, path, prop);
        var fn = mod[prop];
        if (!fn) throw new Error(conf.name + ': exports.' + prop + ' is not defined')
            //api only support post
            //not api only support get
        var isApi = false
        if (apiPath.length > 5) {
            var prefix = apiPath.substring(0, 5)
            if (prefix == '/api/') {
                isApi = true
            }
        }
        if (isApi) {
            //socket.io  
            app.io.route(apiPath, function*(next, ioRequest) {
                    var file = yield parseFileFromSocket(ioRequest)
                        //reset filter
                    this.filter = null
                    this.errors = null
                    ioRequest = ioRequest || {}
                    ioRequest.data = ioRequest.data || {}
                    ioRequest.header = ioRequest.header || {}

                    var request = this.request || {}
                    request.method = 'POST'
                    request.body = ioRequest.data
                    request.query = request.query || {}
                    if (file) {
                        request.file = file
                    }
                    request.get = function(headerkey) {
                        return ioRequest.header[headerkey]
                    }
                    this.req = request
                    this.request = request

                    var response = this.response || {}
                    response.set = function(data) {}
                    this.response = response
                    this.res = response

                    yield next
                })
                //support filter 
            router.use(require('koa-validate')())
            var validSessionIdMiddleware = require('../middleware/valid-session-id-middleware')
            var validHashMiddleware = require('../middleware/valid-hash-middleware')
            var validataMiddleware = conf.validate
            if (validataMiddleware === 'session_id') {
                //validate session_id
                router.use(apiPath, validSessionIdMiddleware())
                router.post(apiPath, fn)
            }
            if (validataMiddleware === 'hash') {
                //validate hash 
                router.use(apiPath, validHashMiddleware())
                router.get(apiPath, fn)
            }
            //socket.io don't add filter middleware,koa.io will filter
            app.io.route(apiPath, require('../middleware/context-middleware')())
            app.io.route(apiPath, require('koa-validate')())
            if (validataMiddleware === 'session_id') {
                //validate session_id
                app.io.route(apiPath, validSessionIdMiddleware())
            }
            if (validataMiddleware === 'hash') {
                //validate hash 
                app.io.route(apiPath, validHashMiddleware())
            }
            app.io.route(apiPath, fn)
        }
    }
}
