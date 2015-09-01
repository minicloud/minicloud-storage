/**
 * Module dependencies.
 */
var Resource = require('koa-resource-router')
var debug = require('debug')('api')
var path = require('path') 
var fs = require('fs')
var join = path.resolve
var filter = require('koa-json-filter')
var readdir = fs.readdirSync

/**
 * Load resources in `root` directory. * 
 *
 * @param {Object} router
 * @param {String} root
 * @api public
 */
module.exports = function(router, root) {
    readdir(root).forEach(function(file) {
        var dir = join(root, file)
        var stats = fs.lstatSync(dir)
        if (stats.isDirectory()) {
            var conf = require(dir + '/config.json')
            conf.name = file
            conf.directory = dir
            route(router, conf)
        }
    })
}

/**
 * Define routes in `conf`.
 * @param {Object} router
 * @param {String} conf
 * @api private
 */

function route(router, conf) {

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
            //support filter 
            router.use(require('koa-validate')())
            //validate Signature
            var validSignatureMiddleware = require('../middleware/valid-signature-middleware')
            router.use(apiPath, validSignatureMiddleware())           
            router.use(filter())
            router.post(apiPath, fn) 
        }
    }
}
