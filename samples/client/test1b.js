/*global lpSdk*/
'use strict';

document.addEventListener('DOMContentLoaded', function (/*event*/) {

  var lp = new lpSdk.LaPoste()
    , goButton = document.getElementById('go');

  goButton.onclick = function () {
    lp.auth({
      consumerKey: document.getElementById('consumerKey').value,
      consumerSecret: document.getElementById('consumerSecret').value,
      username: document.getElementById('username').value,
      password: document.getElementById('password').value
    }, function (err, result) {
      if (err) {
        console.error(err);
        return;
      }
      console.log('result :', result);
    });
  };

});
