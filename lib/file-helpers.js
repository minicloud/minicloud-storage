var crypto = require('crypto')
var fs = require('fs')
    /**
     * return file content sha1
     * @param {Object} app 
     * @param {Integer} statusCode
     * @param {String} error 
     * @param {String} description
     * @api public
     */
var getFileSha1 = function(filePath) {
    return function(done) {
        var shasum = crypto.createHash('sha1')
        var stream = fs.ReadStream(filePath)
        stream.on('data', function(d) {
            shasum.update(d)
        })
        stream.on('end', function() {
            var signature = shasum.digest('hex') 
            return done(null, signature)
        })
    }
}
exports.getFileSha1 = getFileSha1
