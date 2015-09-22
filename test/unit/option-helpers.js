var request = require('co-supertest')
var context = require('../context')
var assert = require('assert')
describe(' option-helpers.js', function() {
    this.timeout(10000)
    var app = null
    var optionHelpers = null
    before(function*(done) {
        optionHelpers = require('../../lib/option-helpers')
        return done()
    })
    it('getSessionTimeout', function*(done) {
        var options = {}
        var value = optionHelpers.getSessionTimeout(options)
        assert.equal(value, 24 * 60 * 60 * 1000)
        var options = {
            session_timeout: '12D'
        }
        var value = optionHelpers.getSessionTimeout(options)
        assert.equal(value, 12 * 24 * 60 * 60 * 1000)
        var options = {
            session_timeout: '8H'
        }
        var value = optionHelpers.getSessionTimeout(options)
        assert.equal(value, 8 * 60 * 60 * 1000)
        var options = {
            session_timeout: '30m'
        }
        var value = optionHelpers.getSessionTimeout(options)
        assert.equal(value, 30 * 60 * 1000)
        var options = {
            session_timeout: '30s'
        }
        var value = optionHelpers.getSessionTimeout(options)
        assert.equal(value, 30 * 1000)
        var options = {
            session_timeout: '3'
        }
        var value = optionHelpers.getSessionTimeout(options)
        assert.equal(value, 24 * 60 * 60 * 1000)
        var options = {
            session_timeout: 'aaam'
        }
        var value = optionHelpers.getSessionTimeout(options)
        assert.equal(value, 24 * 60 * 60 * 1000)
        done()
    })
    it('getSingleFileMaxSize', function*(done) {
        var options = {}
        var value = optionHelpers.getSingleFileMaxSize(options)
        assert.equal(value, 1024)
        var options = {
            single_file_max_size: '8T'
        }
        var value = optionHelpers.getSingleFileMaxSize(options)
        assert.equal(value, 8 * 1024 * 1024)
        var options = {
            single_file_max_size: '30g'
        }
        var value = optionHelpers.getSingleFileMaxSize(options)
        assert.equal(value, 30 * 1024)
        var options = {
            single_file_max_size: '30m'
        }
        var value = optionHelpers.getSingleFileMaxSize(options)
        assert.equal(value, 30)
        var options = {
            single_file_max_size: '3'
        }
        var value = optionHelpers.getSingleFileMaxSize(options)
        assert.equal(value, 1024)
        var options = {
            single_file_max_size: 'aaam'
        }
        var value = optionHelpers.getSingleFileMaxSize(options)
        assert.equal(value, 1024)
        done()
    })
})
