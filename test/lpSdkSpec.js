'use strict';

var chai = require('chai')
  , _ = require('lodash')
  , lpSdk = require('../lib/lp-sdk')
  , should = chai.should();

describe('Open API La Poste SDK', function () {

  this.timeout(5000);

  it('should get a La Poste token', function () {
    var lp = new lpSdk.LaPoste();
    return lp
      .auth({
        consumerKey: process.env['LAPOSTE_API_CONSUMER_KEY'],
        consumerSecret: process.env['LAPOSTE_API_CONSUMER_SECRET'],
        username: process.env['LAPOSTE_API_USERNAME'],
        password: process.env['LAPOSTE_API_PASSWORD']
      })
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

  describe('Digiposte API', function () {
    var dgp = new lpSdk.Digiposte()
      , docId;

    it('should get a Digiposte token', function () {
      return dgp
        .auth({
          accessToken: process.env['LAPOSTE_API_ACCESS_TOKEN'],
          username: process.env['DIGIPOSTE_API_USERNAME'],
          password: process.env['DIGIPOSTE_API_PASSWORD']
        })
        .then(function (result) {
          should.exist(result);
          result.should.have.property('token_type', 'bearer');
          result.should.have.property('expires_in').that.is.a('number').gt(0);
          result.should.have.property('access_token').that.match(/[\w-]+/);
          result.should.have.property('refresh_token').that.match(/[\w-]+/);
        });
    });

    it('should get a Digiposte token based on environment', function (done) {
      return dgp.auth(function (err, result) {
        should.not.exist(err);
        should.exist(result);
        result.should.have.property('token_type', 'bearer');
        result.should.have.property('expires_in').that.is.a('number').gt(0);
        result.should.have.property('access_token').that.match(/[\w-]+/);
        result.should.have.property('refresh_token').that.match(/[\w-]+/);
        done();
      });
    });

    it('should get all documents from Digiposte safebox', function (done) {
      dgp.getDocs(function (err, result) {
        should.not.exist(err);
        should.exist(result);
        result.should.have.property('index', 0);
        result.should.have.property('max_results', 10);
        result.should.have.property('documents').that.is.not.empty;
        result.should.have.property('count').that.is.at.least(result.documents.length);
        done();
      });
    });

    it('should get all documents sorted by title', function () {
      return dgp
        .getDocs({
          sort: 'TITLE',
          direction: 'ASCENDING'
        })
        .then(function (result) {
          var titles;
          should.exist(result);
          result.should.have.property('documents').that.is.not.empty;
          result.should.have.property('count').that.is.at.least(result.documents.length);
          titles = _.pluck(result.documents, 'title');
          titles.should.eql(_.sortBy(titles, 'title'));
        });
    });

    it('should first document from Digiposte safebox', function () {
      return dgp
        .getDocs({
          location: 'safe',
          index: 1,
          maxResults: 1
        })
        .then(function (result) {
          should.exist(result);
          result.should.have.property('index', 1);
          result.should.have.property('max_results', 1);
          result.should.have.property('documents').that.is.not.empty;
          result.should.have.property('count').that.is.at.least(result.documents.length);
          docId = result.documents[0].id;
        });
    });

    it('should get a document by id', function () {
      return dgp
        .getDoc({
          id: docId || process.env['LAPOSTE_API_DOC_ID']
        })
        .then(function (doc) {
          should.exist(doc);
          [
            'geolocalized', 'id', 'category', 'filename', 'title', 'mimetype',
            'size', 'creation_date', 'author_name', 'document_logo', 'location',
            'read', 'shared', 'digishoot', 'certified', 'invoice',
            'eligible2ddoc', 'favorite', 'user_tags', 'sender_tags'
          ].forEach(function (property) {
              doc.should.have.property(property);
            });
        });
    });

    it('should throw an error because of bad document id', function (done) {
      dgp.getDoc({
        id: 'badid'
      }, function (err, doc) {
        should.exist(err);
        should.not.exist(doc);
        err.should.be.an.instanceof(lpSdk.HttpError);
        err.should.have.property('statusCode', 403);
        done();
      });
    });

  });

});