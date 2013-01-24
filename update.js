var email = require('emailjs'),
    crypto = require('crypto'),
    connection = require('./lib/mysql-connection').connection,
    settings = require('./settings').settings;

var server = email.server.connect({
  user: settings.email.user,
  password: settings.email.password,
  host: settings.email.host,
  ssl: settings.email.ssl 
});

connection.query('SELECT * FROM `users` WHERE `status` = ?', ['LOOK'], function(err, rows, fields) {
  if (err) throw err;
  console.log(rows);
  // We want at least three users to participate.
  if (rows.length > 2) {
    var users = rows;
    var userIDs = [];
    for (var i = 0; i < rows.length; i++) {
      userIDs.push(rows[i].id);
    }
    connection.query('UPDATE `users` SET `status`=? WHERE `id` IN (?)', ['WAIT', userIDs], function(err, result) {
      if (err) throw err;
    });
    // Create a new comic.
    connection.query('INSERT INTO `comics` (`finished`) VALUES (?)', [0], function(err, result) {
      if (err) throw err;
      var comicID = result.insertId
        , order = 0;

      // Each user gets 2 panels.
      for (var j = 0; j < 2; j++) {
        for (var k = 0; k < userIDs.length; k++) {
          var token = crypto.createHash('md5').update((comicID + '') + (order + '') + (userIDs[k] + '')).digest('hex');
          order++;

          if (order === 1) {
            sendDrawMail(users[k].username, users[k].email, token, true);
          }

          connection.query('INSERT INTO `panels` (`user_id`, `comic_id`, `order`, `finished`, `edit_token`) VALUES (?, ?, ?, 0, ?)', [userIDs[k], comicID, order, token], function(err, result) {
            if (err) throw err;

            console.log(result.insertId);
          });
        }
      }
    });
  }
});

function sendDrawMail(name, email, token, first) {
  server.send({
    text: 'Hoi, ' + name + ' je moet het eerste plaatje van een nieuwe strip tekenen. Klik op deze link. http://strips.jasperbok.nl/draw/' + token,
    from: 'Chain Comics <chaincomics@gmail.com>',
    to: email,
    subject: 'Het is jouw beurt om te tekenen'
  }, function(err, message) {
    console.log(err||message);
  });
}
