'use strict';

var util = require('util')
  , _ = require('lodash')
  , helpers = require('../helpers');

/**
 * This class provides services of the Digiposte API.
 *
 * @class Digiposte
 * @constructor
 * @param {Object} [options] Options object.
 * @param {String} [options.accessToken] The La Poste access token.
 * @param {String} [options.dgpAccessToken] The Digiposte access token.
 * @param {String} [options.config] Custom configuration.
 * @param {String} [options.config.baseUrl=https://api.laposte.fr/digiposte/1.0] Base URL of API resources.
 * @param {String} [options.config.request] Default configuration for request module.
 */
function Digiposte(opt) {
  var that = this;
  opt = opt || {};
  that.config = {
    baseUrl: process.env['DIGIPOSTE_API_BASE_URL'] || 'https://api.laposte.fr/digiposte/1.0',
    request: {
      strictSSL: process.env['DIGIPOSTE_API_STRICT_SSL'] ? process.env['DIGIPOSTE_API_STRICT_SSL'] !== 'false' : true
    }
  };
  _.extend(that, opt);
  this.apiRequest = helpers.buildAsyncRequest(that.config);
}

/**
 * Authenticate a Digiposte customer, and provide a token for Digiposte API services.
 *
 * The resulting token is stored as "dgpAccessToken" instance attribute.
 *
 * @method auth
 * @async
 * @param {Object} options Options object.
 * @param {String} options.username The Digiposte account username.
 * @param {String} options.password The Digiposte account password.
 * @param {Function} [cb] The callback(err, result) function to be called when the request is fulfilled, if not defined a promise is returned.
 * @optional
 * @return {Promise} A promise, fulfilled when the request is done.
 * @throws {HttpError} An HTTP error including status code and body.
 * @example
 *      var lpSdk = require('lp-sdk')
 *        , dgp = new lpSdk.Digiposte();
 *
 *      dgp.auth({
 *        user: 'tom',
 *        password: 'mypassword'
 *      }, function (err, result) {
 *        if (err) {
 *          console.error(err);
 *          return;
 *        }
 *        console.log('result :', result);
 *      });
 */
Digiposte.prototype.auth = function (opt, cb) {
  var that = this;
  if (typeof cb === 'undefined' && typeof opt === 'function') {
    cb = opt;
    opt = null;
  }
  opt = opt || {};
  return that.apiRequest(
    {
      method: 'POST',
      uri: '/login',
      headers: {
        'Authorization': util.format('Bearer %s', opt.accessToken || process.env['LAPOSTE_API_ACCESS_TOKEN'])
      },
      json: true,
      body: {
        credential: {
          user: opt.username || process.env['DIGIPOSTE_API_USERNAME'],
          password: opt.password || process.env['DIGIPOSTE_API_PASSWORD']
        }
      }
    })
    .spread(helpers.httpErrorHandler)
    .then(function (result) {
      that.accessToken = opt.accessToken || process.env['LAPOSTE_API_ACCESS_TOKEN'];
      that.dgpAccessToken = result['access_token'];
      that.dgpRefreshToken = result['refresh_token'];
      return result;
    })
    .nodeify(cb);
};

/**
 * Get documents of the safebox.
 *
 * @method getDocs
 * @async
 * @param {Object} options Options object.
 * @param {Integer} options.index The index of the pagination.
 * @param {Integer} options.maxResults The maximum number of results returned.
 * @param {String} options.sort The field on which you want to sort the results.
 * @param {String} options.direction The direction in which you want to sort the results, for the given field.
 * @param {Function} [cb] The callback(err, result) function to be called when the request is fulfilled, if not defined a promise is returned.
 * @optional
 * @return {Promise} A promise, fulfilled when the request is done.
 * @throws {HttpError} An HTTP error including status code and body.
 * @example
 *      var lpSdk = require('lp-sdk')
 *        , dgp = new lpSdk.Digiposte({
 *          accessToken: 'zzz-eee-aaa-vvv',
 *          dgpAccessToken: 'kkk-ccc-vvv-rrr'
 *        });
 *
 *      // Get all docs
 *      dgp.getDocs(function (err, result) {
 *        if (err) {
 *          console.error(err);
 *          return;
 *        }
 *        console.log('result :', result);
 *      });
 *
 *      // Get first doc
 *      dgp.getDocs({
 *        index: 1,
 *        maxResults: 1
 *      }, function (err, result) {
 *        if (err) {
 *          console.error(err);
 *          return;
 *        }
 *        console.log('result :', result);
 *      });
 *
 *      // Get docs of the trash location
 *      dgp.getDocs({location: 'trash'}, function (err, result) {
 *        if (err) {
 *          console.error(err);
 *          return;
 *        }
 *        console.log('result :', result);
 *      });
 */
Digiposte.prototype.getDocs = function (opt, cb) {
  var that = this
    , params = {};
  if (typeof cb === 'undefined' && typeof opt === 'function') {
    cb = opt;
    opt = null;
  }
  opt = opt || {};
  if (typeof opt.index !== 'undefined') {
    params.index = opt.index;
  }
  if (typeof opt.maxResults !== 'undefined') {
    params['max_results'] = opt.maxResults;
  }
  if (typeof opt.sort !== 'undefined') {
    params.sort = opt.sort;
  }
  if (typeof opt.direction !== 'undefined') {
    params.direction = opt.direction;
  }
  return that.apiRequest(
    {
      uri: util.format('/documents%s', opt.location ? '/' + opt.location : ''),
      headers: {
        'Authorization': util.format('Bearer %s', that.accessToken),
        'User-Token': that.dgpAccessToken
      },
      json: true,
      qs: params
    })
    .spread(helpers.httpErrorHandler)
    .nodeify(cb);
};

/**
 * Get document by id.
 *
 * @method getDoc
 * @async
 * @param {Object} options Options object.
 * @param {Integer} options.id The document id.
 * @param {Function} [cb] The callback(err, result) function to be called when the request is fulfilled, if not defined a promise is returned.
 * @optional
 * @return {Promise} A promise, fulfilled when the request is done.
 * @throws {HttpError} An HTTP error including status code and body.
 * @example
 * @TODO
 */
Digiposte.prototype.getDoc = function (opt, cb) {
  var that = this;
  return that.apiRequest(
    {
      uri: util.format('/document/%s', opt.id),
      headers: {
        'Authorization': util.format('Bearer %s', that.accessToken),
        'User-Token': that.dgpAccessToken
      },
      json: true
    })
    .spread(helpers.httpErrorHandler)
    .nodeify(cb);
};

/**
 * Get document thumbnail.
 *
 * The result is a Buffer populated with binary data of downloaded thumbnail.
 *
 * @method getDocThumbnail
 * @async
 * @param {Object} options Options object.
 * @param {Integer} options.id The document id.
 * @param {Function} [cb] The callback(err, result) function to be called when the request is fulfilled, if not defined a promise is returned.
 * @optional
 * @return {Promise} A promise, fulfilled when the request is done.
 * @throws {HttpError} An HTTP error including status code and body.
 * @example
 * @TODO
 */
Digiposte.prototype.getDocThumbnail = function (opt, cb) {
  var that = this;
  return that.apiRequest(
    {
      uri: util.format('/document/%s/thumbnail', opt.id),
      headers: {
        'Authorization': util.format('Bearer %s', that.accessToken),
        'User-Token': that.dgpAccessToken
      },
      encoding: null
    })
    .spread(helpers.httpErrorHandler)
    .nodeify(cb);
};

exports = module.exports = Digiposte;