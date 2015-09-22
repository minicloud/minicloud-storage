var S = require('string')
    /**
     * return options session_timeout
     * @param {Object} options 
     * @return {Integer}
     * @api public
     */
exports.getSessionTimeout = function(options) {
        var timeout = options.session_timeout
        if (timeout) {
            timeout = S(timeout).trim().toLowerCase()
            if (timeout.length >= 2) {
                var unit = timeout.substring(timeout.length - 1, timeout.length)
                var value = timeout.substring(0, timeout.length - 1)
                if (S(value).isNumeric()) {
                    if (unit == 'd') {
                        return parseInt(value) * 24 * 60 * 60 * 1000
                    } else if (unit == 'h') {
                        return parseInt(value) * 60 * 60 * 1000
                    } else if (unit == 'm') {
                        return parseInt(value) * 60 * 1000
                    } else if (unit == 's') {
                        return parseInt(value) * 1000
                    }
                }
            }
        }
        return 24 * 60 * 60 * 1000
    }
    /**
     * return options signle file max size
     * @param {Object} options 
     * @return {Integer}
     * @api public
     */
exports.getSingleFileMaxSize = function(options) {
    var maxSize = options.single_file_max_size
    if (maxSize) {
        maxSize = S(maxSize).trim().toLowerCase()
        if (maxSize.length >= 2) {
            var unit = maxSize.substring(maxSize.length - 1, maxSize.length)
            var value = maxSize.substring(0, maxSize.length - 1)
            if (S(value).isNumeric()) {
                if (unit == 't') {
                    return parseInt(value) * 1024 * 1024
                } else if (unit == 'g') {
                    return parseInt(value) * 1024
                } else if (unit == 'm') {
                    return parseInt(value)
                }
            }
        }
    }
    return 1024
}
