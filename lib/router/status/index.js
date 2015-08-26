/**
 * Module dependencies.
 */
var cp = require('child_process')
var fs = require('fs')
var co = require('co')
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
     * @param {String} subPath
     * @return {Array} 
     */
var statServerUsed = function*() {
        var defaultPaths = ['/usr/local/miniyun/miniStore/data/a/', '/usr/local/miniyun/miniStore/data/b/', '/usr/local/miniyun/miniStore/data/c/']
        var paths = []
        for (var i = 0; i < defaultPaths.length; i++) {
            var subPath = defaultPaths[i]
            if (fs.existsSync(subPath)) {
                paths.push(subPath)
            }
        }
        if (paths.length == 0) {
            paths.push('/usr/local/miniyun');
        }
        var disks = []
        for (var i = 0; i < paths.length; i++) {
            var info = yield statDiskUsed(subPath)
            var isPush = false
            var subPath = info.path
            for (var j = 0; j < disks.length; j++) {
                var disk = disks[j]
                if (disk.path === subPath) {
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
    this.body = yield statServerUsed()
}
