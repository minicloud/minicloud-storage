module.exports.Storage = function(options, router, app) {
    return function(done) {
        //init app
        require('co').wrap(function*() {
            var app = yield require("./loader/app-loader")(options, router, app)
            done(null, app)
        })()
    }
}
