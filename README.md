Chaincomics
===========

Draw small comics with other people by email.

Note that at the moment the app is really 'hackety' as I have to finish it
for school... Looks and fail-save code are not a priority ATM.

Installation
------------

Clone the repository and let NPM install all the dependencies:

    npm install

After that, you'll need to create a `settings.js` file in the root directory
of the project (the one where `app.js` is located). Your settings file should
look like this:

    exports.settings = {
      db: {
        host: '',
        dbname: '',
        user: '',
        password: ''
      },
      email: {
        user: '',
        password: '',
        host: '',
        ssl: true
      }
    }

For email I'm using [emailjs](https://github.com/eleith/emailjs "emailjs") so
because it's author has only tested the library using Gmail, I can only
recommend to use that as well.
