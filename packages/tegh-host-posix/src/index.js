import 'source-map-support/register'
var exec = require('child_process').exec
exec("id", function(err, stdout, stderr) {
  console.log(`ID!!!`, stdout);
});
exec("groups", function(err, stdout, stderr) {
  console.log(`GROUPS!!!!!`, stdout);
});

import './posixHost'
