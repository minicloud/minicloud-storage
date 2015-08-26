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
    it(' status/info 200', function*(done) {
        yield file.mkdirp('/usr/local/miniyun/miniStore/data/a')
        yield file.mkdirp('/usr/local/miniyun/miniStore/data/b')
        yield file.mkdirp('/usr/local/miniyun/miniStore/data/c')
        var res = yield request(app)
            .post('/api/v1/status/info')
            .type('json')
            .expect(200)
            .end()
        assert(res.body.length>0,true)
        done()
    })
})
