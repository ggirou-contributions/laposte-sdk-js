'use strict';

var chai = require('chai')
  , lpSdk = require('../lib/lp-sdk')
  , should = chai.should();

describe('LaPoste API', function () {

  this.timeout(10000);

  it('should get a La Poste token', function () {
    var lp = new lpSdk.LaPoste();
    return lp.auth()
      .then(function (result) {
        should.exist(result);
        result.should.have.property('scope', 'default');
        result.should.have.property('token_type', 'Bearer');
        result.should.have.property('expires_in').that.is.a('number').gt(0);
        result.should.have.property('access_token').that.match(/\w+/);
        result.should.have.property('refresh_token').that.match(/\w+/);
        process.env['LAPOSTE_API_ACCESS_TOKEN'] = result['access_token'];
        process.env['LAPOSTE_API_REFRESH_TOKEN'] = result['refresh_token'];
      });
  });

  it('should get a La Poste token based on environment', function (done) {
    var lp = new lpSdk.LaPoste();
    lp.auth(function (err, result) {
      should.not.exist(err);
      should.exist(result);
      result.should.have.property('scope', 'default');
      result.should.have.property('token_type', 'Bearer');
      result.should.have.property('expires_in').that.is.a('number').gt(0);
      result.should.have.property('access_token').that.match(/\w+/);
      result.should.have.property('refresh_token').that.match(/\w+/);
      process.env['LAPOSTE_API_ACCESS_TOKEN'] = result['access_token'];
      done();
    });
  });

  it('should refresh the La Poste token', function () {
    var lp = new lpSdk.LaPoste();
    return lp.refeshAccessToken()
      .then(function (result) {
        should.exist(result);
        result.should.have.property('scope', 'default');
        result.should.have.property('token_type', 'Bearer');
        result.should.have.property('expires_in').that.is.a('number').gt(0);
        result.should.have.property('access_token').that.match(/\w+/);
        result.should.have.property('refresh_token').that.match(/\w+/);
        process.env['LAPOSTE_API_ACCESS_TOKEN'] = result['access_token'];
      });
  });

});