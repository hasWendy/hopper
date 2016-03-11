/*
  takes a string of comma separated ids as post data, splits, gets mo' data
  ezpz.
*/
var data = require('../data/data');
var imm = require('immutable');

data = imm.fromJS(data);

module.exports = function(router) {
  router.post('/brands', function(req, res) {
    var ids = imm.fromJS(req.body.ids);

    var output = [];
    ids.forEach(function(item) {
      console.log(data.get(item.toString()));
      output.push(data.get(item.toString()));
    });

    res.send(output);
  });
}
