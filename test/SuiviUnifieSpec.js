'use strict';

var chai = require('chai')
  //, _ = require('lodash')
  , lpSdk = require('../lib/lp-sdk')
  , should = chai.should();

xdescribe('SuiviUnifie API', function () {
  var lp = new lpSdk.LaPoste()
    , suivi = new lpSdk.SuiviUnifie();

  this.timeout(10000);

  before(function () {
    return lp.auth()
      .then(function (result) {
        console.log('accessToken :',result['access_token']);
        process.env['LAPOSTE_API_ACCESS_TOKEN'] = result['access_token'];
        process.env['LAPOSTE_API_REFRESH_TOKEN'] = result['refresh_token'];
      });
  });

  it('should get a document by id', function () {
    return suivi
      .getParcel({code: process.env['SUIVIUNIFIE_API_CODE']})
      .then(function (result) {
        should.exist(result);
        console.log('result :', result);
      });
  });

});