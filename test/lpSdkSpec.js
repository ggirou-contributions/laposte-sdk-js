'use strict';

var chai = require('chai')
  , lpSdk = require('../lib/lp-sdk')
  , expect = chai.expect
  , should = chai.should();

describe('sdk', function () {

  this.timeout(5000);

  it('should', function () {
    var lp = new lpSdk.LaPoste()
      , dgp = new lpSdk.Digiposte();
    return lp
      .auth({
        consumerKey: process.env['LAPOSTE_API_CONSUMER_KEY'],
        consumerSecret: process.env['LAPOSTE_API_CONSUMER_SECRET'],
        username: process.env['LAPOSTE_API_USERNAME'],
        password: process.env['LAPOSTE_API_PASSWORD']
      })
      .then(function (result) {
        console.log('got token :', result);
      })
      .then(function () {
        return dgp.auth({
          accessToken: lp.accessToken,
          username: process.env['DIGIPOSTE_API_USERNAME'],
          password: process.env['DIGIPOSTE_API_PASSWORD']
        });
      })
      .then(function (result) {
        console.log('got Digiposte token :', result);
      })
      .then(function () {
        return dgp.getDocs({
          location: 'safe',
          index: 1,
          maxResults: 1
        });
      })
      .then(function (result) {
        var docId;
        console.log('docs :', result.documents);
        docId = result.documents[0].id;
        return dgp.getDoc({
          id: docId
        });
      })
        .then(function (doc) {
        console.log('doc :', doc);
      });
  });

});