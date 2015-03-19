'use strict';

var util = require('util');

/**
 * @class HttpError
 * @extends Error
 * @constructor
 * @param {Integer} statusCode Status code of the HTTP response.
 * @param {String} [body] Body of the HTTP response.
 */
function HttpError(statusCode, body) {
  this.name = 'HttpError';
  this.message = util.format('Http error %s%s', statusCode, body ? util.format(' [ %s ]', typeof body === 'string' ? body : JSON.stringify(body)) : '');
  this.statusCode = statusCode;
  this.body = body;
}
HttpError.prototype = Error.prototype;

exports = module.exports = HttpError;