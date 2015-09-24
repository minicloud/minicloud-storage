    /**
     * set global variables to request
     *
     * @param {Object} opts 
     * @api public
     */
    module.exports = function(opts) {
        return function* miniHost(next) { 
            var miniHost = this.request.get('host')
            this.request.miniHost = 'http://' + miniHost
            this.request.storeContext = global.storeContext
            return yield * next
        }
    }
