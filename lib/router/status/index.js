/**
 * Module dependencies.
 */
var cp = require('child_process')
var fs = require('fs')
var co = require('co')
var webHelpers = require('../../web-helpers')
var request = require("co-request")
String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '')
    }
    /*
     * return directory hard disk usage
     * @param {String} subPath
     * @return {Object} 
     */
var statDiskUsed = function(subPath) {
        return function(done) {
            cp.exec('df -k ' + subPath, function(err, resp) {
                var info = resp.toString()
                var pos1 = info.indexOf('/')
                var pos2 = info.indexOf(' ', pos1)
                var diskPath = info.substring(pos1, pos2 - 1)
                var pathInfo = info.substring(pos2, info.length)
                var items = pathInfo.trim().split(' ')
                return done(null, {
                    path: diskPath,
                    used: parseInt(items[1]),
                    total: parseInt(items[0])
                })
            })
        }
    }
    /*
     * return server hard disk usage
     * @param {Object} options
     * @return {Array} 
     */
var statServerUsed = function*(options) {
        var defaultPaths = options.path
        var paths = ['/usr/local/miniyun']
        if (defaultPaths.length > 0) {
            paths = []
            for (var i = 0; i < defaultPaths.length; i++) {
                var subPath = defaultPaths[i]
                if (fs.existsSync(subPath)) {
                    paths.push(subPath)
                }
            }
        }

        var disks = []
        for (var i = 0; i < paths.length; i++) {
            var subPath = paths[i]
            var info = yield statDiskUsed(subPath)
            var isPush = false
            var realySubPath = info.path
            for (var j = 0; j < disks.length; j++) {
                var disk = disks[j]
                if (disk.path === realySubPath) {
                    isPush = true
                }
            }
            if (!isPush) {
                disks.push(info)
            }
        }
        return disks
    }
    /**
     * store server information
     * @api public
     */
exports.info = function*() {
        this.body = yield statServerUsed(this.request.appContext)
    }
    /**
     * check store server and minicloud server network status
     * @api public
     */
exports.check = function*() {
    //check required fields
    this.checkBody('minicloud_host').notEmpty('missing required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    //biz
    var body = this.request.body
    var minicloudHost = body.minicloud_host
    var result = {
        statusCode: 400
    }
    try {
        var result = yield request(minicloudHost)
    } catch (err) {

    }
    if (result.statusCode !== 200) {
        webHelpers.throw409(this, 'strorage_unable_connect_minicloud', 'Unable to connect the minicloud server.')
        return
    }
    this.body = ''

}
