'use strict';

var util = require('util')
  , request = require('request')
  , _ = require('lodash')
  , urljoin = require('url-join')
  , Promise = require('bluebird')
  , pkg = require('../package')
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
  var requestConfig, asyncRequest;
  requestConfig = _.extend({
    strictSSL: process.env['LAPOSTE_API_STRICT_SSL'] ? process.env['LAPOSTE_API_STRICT_SSL'] !== 'false' : true,
    headers: {
      'User-Agent': util.format('%s/%s', pkg.name, pkg.version)
    }
  }, config.request);
  asyncRequest = Promise.promisify(request.defaults(requestConfig));
  return function (opt) {
    opt.uri = urljoin(config.baseUrl, opt.uri);
    return asyncRequest(opt);
  };
};