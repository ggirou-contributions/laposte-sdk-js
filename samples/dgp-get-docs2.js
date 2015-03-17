'use strict';

var lpSdk = require('../lib/lp-sdk')
  , dgp = new lpSdk.Digiposte({
    accessToken: process.env['LAPOSTE_API_ACCESS_TOKEN'],
    dgpAccessToken: process.env['DIGIPOSTE_API_ACCESS_TOKEN']
  });

dgp.getDocs({
  index: 1,
  maxResults: 1
}, function (err, result) {
  if (err) {
    console.error(err);
    return;
  }
  console.log('result :', result);
});