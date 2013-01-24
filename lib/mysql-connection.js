var mysql = require('mysql'),
    settings = require('../settings').settings;

var connection = mysql.createConnection({
  host: settings.db.host,
  database: settings.db.dbname,
  user: settings.db.user,
  password: settings.db.password
});

connection.connect();
connection.query('USE ' + settings.db.dbname);

exports.connection = connection;
