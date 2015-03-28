'use strict';

var chai = require('chai')
  , _ = require('lodash')
  , lpSdk = require('../lib/lp-sdk')
  , should = chai.should();

describe('Digiposte API', function () {
  var lp = new lpSdk.LaPoste()
    , dgp = new lpSdk.Digiposte()
    , docId;

  this.timeout(10000);

  before(function () {
    return lp.auth()
      .then(function (result) {
        process.env['LAPOSTE_API_ACCESS_TOKEN'] = result['access_token'];
        process.env['LAPOSTE_API_REFRESH_TOKEN'] = result['refresh_token'];
      });
  });

  describe('Digiposte token', function () {

    it('should get a Digiposte token', function () {
      return dgp.auth()
        .then(function (result) {
          should.exist(result);
          result.should.have.property('token_type', 'bearer');
          result.should.have.property('expires_in').that.is.a('number').gt(0);
          result.should.have.property('access_token').that.match(/[\w-]+/);
          result.should.have.property('refresh_token').that.match(/[\w-]+/);
        });
    });

    it('should get a Digiposte token with callback', function (done) {
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

  });

  describe('Features', function () {

    before(function () {
      return dgp.auth();
    });

    it('should get the terms of use', function () {
      return dgp.getTou()
        .then(function (result) {
          should.exist(result);
          result.should.have.property('version');
          result.should.have.property('href');
        });
    });

    describe('Documents', function () {

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
            titles.should.eql(_.sortBy(titles, function (a, b) {
              return a < b;
            }));
          });
      });

      it('should get all documents sorted by title descending', function () {
        return dgp
          .getDocs({
            sort: 'TITLE',
            direction: 'DESCENDING'
          })
          .then(function (result) {
            var titles;
            should.exist(result);
            result.should.have.property('documents').that.is.not.empty;
            result.should.have.property('count').that.is.at.least(result.documents.length);
            titles = _.pluck(result.documents, 'title');
            titles.should.eql(_.sortBy(titles, function (a, b) {
              return a > b;
            }));
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
            id: docId || process.env['DIGIPOSTE_API_DOC_ID']
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

      it('should get a document thumbnail', function () {
        return dgp
          .getDocThumbnail({
            id: docId || process.env['DIGIPOSTE_API_DOC_ID']
          })
          .then(function (content) {
            should.exist(content);
            content.should.be.an.instanceOf(Buffer);
            content.should.have.length(711);
          });
      });

    });

    describe('Profile', function () {

      it('should get the user profile', function () {
        return dgp.getProfile()
          .then(function (profile) {
            should.exist(profile);
            [
              'id', 'title', 'first_name', 'last_name', 'date_of_birth', 'id_xiti',
              'login', 'user_type', 'status', 'space_used', 'space_free',
              'space_max', 'space_not_computed', 'author_name', 'support_available', 'tos_version',
              'tos_updated_at', 'share_space_status', 'partial_account', 'basic_user', 'offer_pid',
              'offer_updated_at', 'show2ddoc', 'idn_valid', 'last_connexion_date', 'completion'
            ].forEach(function (property) {
                profile.should.have.property(property);
              });
            profile.title.should.equal('MR');
            profile['first_name'].should.equal('digiposte');
            profile['last_name'].should.equal('digiposte');
            profile.login.should.equal(dgp.username);
            profile['user_type'].should.equal('PERSON');
            profile.status.should.equal('VALID');
            profile['space_used'].should.be.gt(0);
            profile['space_free'].should.be.gt(0);
            profile['space_max'].should.be.gt(0);
            profile['partial_account'].should.be.false;
            profile['basic_user'].should.be.true;
          });
      });

      it('should get the profile avatar', function () {
        return dgp.getProfileAvatar()
          .then(function (content) {
            should.exist(content);
            content.should.be.an.instanceOf(Buffer);
            content.should.have.length(11165);
          });
      });

    });

  });

});