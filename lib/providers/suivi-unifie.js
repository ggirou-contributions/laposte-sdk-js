'use strict';

var util = require('util')
  , _ = require('lodash')
  , helpers = require('../helpers');

/**
 * This class provides services of the SuiviUnifie API.
 *
 * @class SuiviUnifie
 * @constructor
 * @param {Object} [options] Options object.
 * @param {String} [options.accessToken] The La Poste access token.
 * @param {String} [options.config] Custom configuration.
 * @param {String} [options.config.baseUrl=https://api.laposte.fr/suiviunifie/1.0] Base URL of API resources.
 * @param {String} [options.config.request] Default configuration for request module.
 */
function SuiviUnifie(opt) {
  var that = this;
  opt = opt || {};
  that.config = {baseUrl: process.env['SUIVIUNIFIE_API_BASE_URL'] || 'https://api.laposte.fr/suiviunifie/1.0'};
  _.extend(that, opt);
  this.apiRequest = helpers.buildAsyncRequest(that.config);
}

/**
 * Get parcel by code.
 *
 * @method getParcel
 * @async
 * @param {Object} options Options object.
 * @param {Integer} options.code The parcel code.
 * @param {Function} [cb] The callback(err, result) function to be called when the request is fulfilled, if not defined a promise is returned.
 * @optional
 * @return {Promise} A promise, fulfilled when the request is done.
 * @throws {HttpError} An HTTP error including status code and body.
 * @example
 * @TODO
 */
SuiviUnifie.prototype.getParcel = function (opt, cb) {
  var that = this;
  return that.apiRequest(
    {
      uri: '/parcel',
      headers: {
        'Authorization': util.format('Bearer %s', that.accessToken)
      },
      qs: {
        key: process.env['SUIVIUNIFIE_API_KEY'],
        method: 'json',
        code: opt.code
      },
      json: true
    })
    .spread(helpers.httpErrorHandler)
    .nodeify(cb);
};

exports = module.exports = SuiviUnifie;