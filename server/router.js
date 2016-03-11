var fs = require('fs');
var express = require('express');

module.exports = function(path) {
  var r = express.Router();
  fs.readdirSync(path).forEach(function(file) {
    if (file.match(/\.js$/)) {
      require(path + file)(r);
    }
  });
  return r;
};
