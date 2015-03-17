'use strict';

var lpSdk = require('../lib/lp-sdk')
  , lp = new lpSdk.LaPoste();

lp.auth({
  consumerKey: process.env['LAPOSTE_API_CONSUMER_KEY'],
  consumerSecret: process.env['LAPOSTE_API_CONSUMER_SECRET'],
  username: process.env['LAPOSTE_API_USERNAME'],
  password: process.env['LAPOSTE_API_PASSWORD']
}, function (err, result) {
  if (err) {
    console.error(err);
    return;
  }
  console.log('result :', result);
});