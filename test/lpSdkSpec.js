'use strict';

var chai = require('chai')
  , _ = require('lodash')
  , should = chai.should();

describe('Open API La Poste SDK', function () {

  it('should get a La Poste SDK instance', function () {
    var lpSdk = require('../lib/lp-sdk')
      , serviceNames = ['LaPoste', 'HttpError', 'Digiposte'/*, 'SuiviUnifie'*/];
    should.exist(lpSdk);
    lpSdk.should.be.ok;
    serviceNames.forEach(function (serviceName) {
      lpSdk.should.have.property(serviceName).that.is.a('function');
    });
    _.omit(lpSdk, serviceNames).should.eql({});
  });

});