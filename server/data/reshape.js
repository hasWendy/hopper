var data = require('./brands.js');
var imm = require('immutable');
var file = require('fs');

data = imm.fromJS(data);

var newData = imm.Map();

data.forEach(function(item) {
  newData = newData.set(item.get('id'), item);
});

file.writeFile(
  './data.js',
  'module.exports=' + JSON.stringify(newData.toJS()) + '',
  function(err) {
    if(err) {
      return console.log(err);
    }

    console.log('new data saved');
  }
);
