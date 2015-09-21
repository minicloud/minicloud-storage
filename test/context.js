process.setMaxListeners(0)
var client = require('./socket-io-client')
var fs = require('fs')
var path = require('path')
var fsPlus = require('co-fs-plus')
var initSocketClient = function(app) {
        return function(done) {
            var socket = client(app)
            socket.on('connect', function() {
                done(null, socket)
            })
        }
    }
    /**
     * delete folder
     * @param {String} sourcePath
     * @param {String} aimPath   
     * @return {Boolean}
     * @api private
     */
var _deleteFolder = function(filePath) {
        var files = []
        if (fs.existsSync(filePath)) {
            files = fs.readdirSync(filePath)
            files.forEach(function(file, index) {
                var curPath = path.join(filePath, file)
                if (fs.statSync(curPath).isDirectory()) { // recurse
                    _deleteFolder(curPath)
                } else { // delete file
                    fs.unlinkSync(curPath)
                }
            })
            fs.rmdirSync(filePath)
        }
    }
    /**
     * Return test App
     * @return {Koa}
     * @api public
     */
exports.getApp = function*() {
    if (!global.app) {
        var app = yield require('../')()
        global.app = app.listen()
        global.socket = yield initSocketClient(app)
    }
    _deleteFolder('./cache')
    _deleteFolder('./data')
    yield fsPlus.mkdirp('./cache')
    yield fsPlus.mkdirp('./data')
    return global.app
}
