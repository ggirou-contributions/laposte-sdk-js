'use strict';

var _ = require('lodash')
  , HttpError = require('./http-error')
  , helpers = require('./helpers')
  , laPosteSdk;

/**
 * This class provides general service about La Poste Open API.
 *
 * @class LaPoste
 * @constructor
 * @param {Object} [options] Options object.
 * @param {String} [options.config] Custom configuration.
 * @param {String} [options.config.baseUrl=https://api.laposte.fr/digiposte/1.0] Base URL of API resources.
 * @param {String} [options.config.request] Default configuration for request module.
 */
function LaPoste(config) {
  var that = this;
  that.config = {
    baseUrl: process.env['LAPOSTE_API_BASE_URL'] || 'https://api.laposte.fr/',
    request: {
      strictSSL: process.env['LAPOSTE_API_STRICT_SSL'] ? process.env['LAPOSTE_API_STRICT_SSL'] !== 'false' : true
    }
  };
  _.extend(that.config, config);
  this.apiRequest = helpers.buildAsyncRequest(that.config);
}

/**
 * Authenticate a developer, and provide a token for La Poste Open API.
 *
 * The resulting token is stored as "accessToken" instance attribute.
 *
 * @method auth
 * @async
 * @param {Object} options Options object.
 * @param {String} options.consumerKey The consumer key.
 * @param {String} options.consumerSecret The consumer secret.
 * @param {String} options.username The developer account username.
 * @param {String} options.password The developer account password.
 * @param {Function} [cb] The callback(err, result) function to be called when the request is fulfilled, if not defined a promise is returned.
 * @optional
 * @return {Promise} A promise, fulfilled when the request is done.
 * @throws {HttpError} An HTTP error including status code and body.
 * @example
 *
 *      var lpSdk = require('lp-sdk')
 *        , lp = new lpSdk.LaPoste();
 *
 *      lp.auth({
 *        consumerKey: 'zzzz-aaa-ccc',
 *        consumerSecret: 'aaaa-ccc-rrr',
 *        username: 'john',
 *        password: 'mysecret'
 *      }, function (err, result) {
 *        if (err) {
 *          console.error(err);
 *          return;
 *        }
 *        console.log('result :', result);
 *      });
 *
 */
LaPoste.prototype.auth = function (opt, cb) {
  var that = this;
  if (typeof cb === 'undefined' && typeof opt === 'function') {
    cb = opt;
    opt = null;
  }
  opt = opt || {};
  return that.apiRequest(
    {
      method: 'POST',
      uri: '/oauth2/token',
      json: true,
      form: {
        'client_id': opt.consumerKey || process.env['LAPOSTE_API_CONSUMER_KEY'],
        'client_secret': opt.consumerSecret || process.env['LAPOSTE_API_CONSUMER_SECRET'],
        'grant_type': 'password',
        username: opt.username || process.env['LAPOSTE_API_USERNAME'],
        password: opt.password || process.env['LAPOSTE_API_PASSWORD']
      }
    })
    .spread(helpers.httpErrorHandler)
    .then(function (result) {
      that.accessToken = result['access_token'];
      that.refreshToken = result['refresh_token'];
      return result;
    })
    .nodeify(cb);
};

/**
 * Refresh the La Poste Open API access token.
 *
 * The resulting token is stored as "accessToken" instance attribute.
 *
 * @method refeshAccessToken
 * @async
 * @param {Object} options Options object.
 * @param {String} options.consumerKey The consumer key.
 * @param {String} options.consumerSecret The consumer secret.
 * @param {String} [options.refreshToken=this.refreshToken] The refresh token.
 * @param {Function} [cb] The callback(err, result) function to be called when the request is fulfilled, if not defined a promise is returned.
 * @optional
 * @return {Promise} A promise, fulfilled when the request is done.
 * @throws {HttpError} An HTTP error including status code and body.
 * @example
 *
 *      var lpSdk = require('lp-sdk')
 *        , lp = new lpSdk.LaPoste();
 *
 *      lp.auth({
 *        consumerKey: 'zzzz-aaa-ccc',
 *        consumerSecret: 'aaaa-ccc-rrr',
 *        username: 'john',
 *        password: 'mysecret'
 *      }, function (err, result) {
 *        if (err) {
 *          console.error(err);
 *          return;
 *        }
 *        console.log('result :', result);
 *      });
 *
 */
LaPoste.prototype.refeshAccessToken = function (opt, cb) {
  var that = this;
  if (typeof cb === 'undefined' && typeof opt === 'function') {
    cb = opt;
    opt = null;
  }
  opt = opt || {};
  return that.apiRequest(
    {
      method: 'POST',
      uri: '/oauth2/token',
      json: true,
      form: {
        'client_id': opt.consumerKey || process.env['LAPOSTE_API_CONSUMER_KEY'],
        'client_secret': opt.consumerSecret || process.env['LAPOSTE_API_CONSUMER_SECRET'],
        'grant_type': 'refresh_token',
        'refresh_token':opt.refreshToken || that.refreshToken || process.env['LAPOSTE_API_REFRESH_TOKEN']
      }
    })
    .spread(helpers.httpErrorHandler)
    .then(function (result) {
      that.accessToken = result['access_token'];
      that.refreshToken = result['refresh_token'];
      return result;
    })
    .nodeify(cb);
};

/**
 * Provides the base class of the La Poste Open API SDK.
 *
 * @module laPosteSdk
 */
laPosteSdk = {
  LaPoste: LaPoste,
  Digiposte: require('./providers/digiposte'),
  //SuiviUnifie: require('./providers/suivi-unifie'),
  HttpError: HttpError
};

exports = module.exports = laPosteSdk;