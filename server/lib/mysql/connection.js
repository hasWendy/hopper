
var mysql = require('mysql');
var connectionInfo = global.conf.settings.database;

var pool = mysql.createPool({
  connectionLimit : 15,
  host            : connectionInfo.host,
  port            : connectionInfo.port,
  user            : connectionInfo.user,
  password        : connectionInfo.password,
  database        : connectionInfo.database
});


module.exports = pool;
