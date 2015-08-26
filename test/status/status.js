var request = require('co-supertest')
var file = require('co-fs-plus')
var context = require('../context')
var assert = require('assert')
describe(' status', function() {
    this.timeout(10000)
    var app = null
    before(function*(done) {
        app = yield context.getApp()
        return done()
    })
    it(' status/info 401', function*(done) {
        var paths = global.appContext.path
        for (var i = 0; i < paths.length; i++) {
            var subPath = paths[i]
            yield file.mkdirp(subPath)
        }
        yield request(app)
            .post('/api/v1/status/info')
            .type('json')
            .expect(401)
            .end()
        done()
    })
    it(' status/info 200', function*(done) {
        var paths = global.appContext.path
        for (var i = 0; i < paths.length; i++) {
            var subPath = paths[i]
            yield file.mkdirp(subPath)
        }
        var res = yield request(app)
            .post('/api/v1/status/info')
            .type('json')
            .set({
                SafeCode: global.appContext.safe_code
            })
            .expect(200)
            .end() 
        assert(res.body.length > 0, true)
        done()
    })
})
