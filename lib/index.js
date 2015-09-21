module.exports.Storage = function(app,router,options) {
    return function(done) {
        //init app
        require('co').wrap(function*() {
            var app = yield require("./loader/app-loader")(app,router,options)
            done(null, app)
        })()
    }
}
