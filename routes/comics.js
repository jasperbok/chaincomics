var connection = require('../lib/mysql-connection').connection
  , mailer = require('emailjs');

exports.viewComic = function(req, res) {
  var comicID = req.param('id');

  connection.query('SELECT `data` FROM `panels` WHERE `comic_id` = ? ORDER BY `order` ASC', [comicID], function(error, rows, fields) {
    if (error) throw error;

    res.render('comic', {imageData: rows});
  });
}

exports.viewPanel = function(req, res) {
  connection.query('SELECT * FROM `panels` WHERE `edit_token` = ?', [req.param('token')], function(error, rows, fields) {
    if (error) {throw error;}
    if (rows.length > 0) {
      res.render('view-panel', {
        imageData: rows[0].data,
        error: false
      });
    } else {
      res.render('view-panel', {
        error: 'Panel does not exist'
      });
    }
  });
}

exports.draw = function(req, res) {
  connection.query('SELECT * FROM `panels` WHERE `edit_token` = ? AND `finished` = ?', [req.param('token'), 0], function(err, rows, fields) {
    if (err) throw err;

    if (rows.length === 0) {
      res.render('draw', {});
    } else if (rows.length === 1) {
      res.render('draw', {token: rows[0].edit_token});
    } else {
      res.render('error', {error: 'Too many panels found for token: ' + req.param('token')});
    }
  });
}

exports.submit = function(req, res) {
  var base64Data = req.param('base64')
    , token = req.param('token');

  console.log('Data: ' + base64Data);
  console.log('Token: ' + token);

  if (base64Data && token) {
    connection.query('SELECT * FROM `panels` WHERE `edit_token` = ?', [token], function(error, rows, fields) {
      if (error) {throw error;}

      var panel = rows[0];
      var comicID = rows[0].comic_id;
      
      if (panel.finished === 0) {
        // Mark the submitted panel as finished and update its image data.
        connection.query('UPDATE `panels` SET `data` = ?, `finished` = ? WHERE `id` = ? AND `finished` = ?', [base64Data, 1, panel.id, 0], function(error, result) {
          if (error) {throw error;}

          connection.query('UPDATE `users` SET `status` = ? WHERE `id` = ?', ['WAIT', panel.user_id], function(){});

          // Select the next panel.
          connection.query('SELECT * FROM `panels` WHERE `comic_id` = ? AND `order` = ?', [panel.comic_id, (panel.order + 1)], function(error, rows, fields) {
            if (error) {throw error;}

            if (rows.length > 0) {
              // There is another panel.
              var panel2 = rows[0];

              connection.query('UPDATE `users` SET `status` = ? WHERE `id` = ?', ['DRAW', panel2.user_id], function(){});
              connection.query('SELECT * FROM `users` WHERE `id` = ?', [panel2.user_id], function(error, rows, fields) {
                if (error) {throw error;}

                sendNextUserMail(rows[0], panel.edit_token, panel2.edit_token, req.headers.host);
                res.render('index');
              });
            } else {
              // No more panels, so this comic is finished.
              connection.query('UPDATE `comics` SET `finished` = ? WHERE `id` = ?', [1, panel.comic_id], function(){});
              connection.query('SELECT DISTINCT * from `users` WHERE `id` IN (SELECT `user_id` FROM `panels` WHERE `comic_id` = ?)', [panel.comic_id], function(error, rows, fields) {
                if (error) {throw error;}
                console.log(rows);

                sendComicEndMail(rows, req.headers.host, comicID);
                res.render('index');
              });
            }
          });
        });
      } else {
        res.render('error', {error: 'The panel with that token has already been drawn.'});
      }
    });
  }
}

function sendComicEndMail(users, host, comicID) {
  var server = mailer.server.connect({
    user: 'chaincomics',
    password: 'Snotlap01',
    host: 'smtp.gmail.com',
    ssl: true
  })
    , toUsers = "";

  for (var i = 0; i < users.length; i++) {
    toUsers = toUsers + users[i].username + " <" + users[i].email + ">, "
  }

  toUsers = toUsers.slice(0, toUsers.length - 2);

  var message = {
    text: "Je hebt samen met andere gebruikers een strip afgerond.\n\nJe kan de strip bekijken op de volgende URL: http://" + host + "/comic/" + comicID +"\n\nVul alsjeblieft ook de volgende vragenlijst in zodat ik mijn concept kan verbeteren: http://docs.google.com/spreadsheet/viewform?formkey=dEx6WEJPU29sR1ktTTVwRmlVaGV5YUE6MQ",
    from: "Chain Comics <chaincomics@gmail.com>",
    to: toUsers,
    subject: "Er is een strip afgerond"
  };

  server.send(message, function(error, message) {
    console.log(error || message);
  });
}

function sendNextUserMail(user, prevToken, editToken, host) {
  var server = mailer.server.connect({
    user: 'chaincomics',
    password: 'Snotlap01',
    host: 'smtp.gmail.com',
    ssl: true
  });

  var message = {
    text: "Het is jouw beurt om te tekenen.\nKlik hier om de vorige afbeelding te zien: http://" + host + "/panel/" + prevToken + "\nKlik hier om te tekenen: http://" + host + "/draw/" + editToken,
    from: "Chain Comics <chaincomics@gmail.com>",
    to: user.username + " <" + user.email + ">",
    subject: "Jij moet tekenen"
  };
  
  server.send(message, function(error, message) {
    console.log(error || message);
  });
}
