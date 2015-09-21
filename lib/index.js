module.exports = function(app,options) {
    return function(done) {
        //init app
        require('co').wrap(function*() {
            var app = yield require("./loader/app-loader")(app,options)
            done(null, app)
        })()
    }
}
