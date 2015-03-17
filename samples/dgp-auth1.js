'use strict';

var lpSdk = require('../lib/lp-sdk')
  , dgp = new lpSdk.Digiposte();

dgp.auth({
  accessToken: process.env['LAPOSTE_API_ACCESS_TOKEN'],
  username: process.env['DIGIPOSTE_API_USERNAME'],
  password: process.env['DIGIPOSTE_API_PASSWORD']
}, function (err, result) {
  if (err) {
    console.error(err);
    return;
  }
  console.log('result :', result);
});