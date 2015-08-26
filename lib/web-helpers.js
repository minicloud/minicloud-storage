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
