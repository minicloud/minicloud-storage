'use strict'
/**
 * throw  exception
 * @param {Object} app 
 * @param {Integer} statusCode
 * @param {String} error 
 * @param {String} description
 * @api public
 */
exports.throw = function(app, statusCode, error, description) {
        var error = {
            code: statusCode,
            error: error,
            error_description: description
        }
        app.status = statusCode
        app.body = error
    }
    /**
     * throw exception 400
     * @param {Object} app 
     * @api public
     */
exports.throw400 = function(app) {
        var url = app.request.url
            // /api/v1/oauth2/token->oauth2/token
        var functionName = url.substring(8, url.length)
        var errors = {
            error: 'Error in call to API function ' + functionName,
            error_description: app.errors
        }
        app.status = 400
        app.body = errors
    }