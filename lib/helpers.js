'use strict';

var request = require('request')
  , urljoin = require('url-join')
  , Promise = require('bluebird')
  , HttpError = require('./http-error');

if (process.env['NODE_ENV'] === 'development') {
  require('request-debug')(request);
}

/**
 * @private
 * @method httpErrorHandler
 */
exports.httpErrorHandler = function (res, body) {
  if (res.statusCode < 200 || res.statusCode >= 300) {
    throw new HttpError(res.statusCode, body);
  }
  return body;
};

/**
 * @private
 * @method buildAsyncRequest
 */
exports.buildAsyncRequest = function (config) {
  var asyncRequest = Promise.promisify(request.defaults(config.request));
  return function (opt) {
    opt.uri = urljoin(config.baseUrl, opt.uri);
    return asyncRequest(opt);
  };
};