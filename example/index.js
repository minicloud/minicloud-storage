require('co').wrap(function*(){
    var app = yield require('../')()
    app.listen(8031)
})()