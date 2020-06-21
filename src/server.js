// Set the process name for use in the stop script
require('process').title = 'impeach';
const { is_prod } = require('./util.js');

const shut_down = (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! Shutting down...');
  process.exit(1);
};
process.on('unhandledException', shut_down);

// Configure the OpenID Connect strategy for use by Passport.
const passport = require('passport');
const Strategy = require('passport-openidconnect').Strategy;
passport.use(
  new Strategy(
    {
      issuer: 'https://sso.csh.rit.edu/auth/realms/csh',
      authorizationURL:
        'https://sso.csh.rit.edu/auth/realms/csh/protocol/openid-connect/auth',
      tokenURL:
        'https://sso.csh.rit.edu/auth/realms/csh/protocol/openid-connect/token',
      userInfoURL:
        'https://sso.csh.rit.edu/auth/realms/csh/protocol/openid-connect/userinfo',
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: 'http://' + process.env.HOST + '/login/callback',
    },
    (accessToken, refreshToken, profile, cb) => {
      return cb(null, profile);
    }
  )
);

// Configure Passport authenticated session persistence.
passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

// Create a new Express application.
const express = require('express');
const app = express();
const axios = require('axios');

let Sentry;
// Configure sentry
if (is_prod && process.env.SENTRY_DSN) {
  Sentry = require('@sentry/node');
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  });
  app.use(Sentry.Handlers.requestHandler());
}

// Configure body parsing
const bodyParser = require('body-parser');
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

// Configure session handling
app.use(
  require('express-session')({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

// Initialize Passport and restore authentication state from the session.
app.use(passport.initialize());
app.use(passport.session());

// Authentication: authenticates with CSH OIDC and returns to origin point
app.get('/login', passport.authenticate('openidconnect'));

app.get(
  '/login/callback',
  passport.authenticate('openidconnect', {
    failureRedirect: '/login',
  }),
  (req, res) => {
    res.redirect(req.session.returnTo);
  }
);

// Static assets
app.use(express.static('static'));

// Require login
app.use(require('connect-ensure-login').ensureLoggedIn());

// Set the templating engine
app.set('view engine', 'pug');
app.set('views', './src/views');

// Routes
const routes = require('./routes.js');
const { err_404, handle_error } = require('./error.js');

app.get('/', routes.root_get);
app.post('/', routes.root_submit);

app.get('/current-evals', routes.current_evals_get);
app.get('/archive', routes.archive_get);

app.post('/api/delet/:id', routes.delet);

app.use(err_404);

// Error handling
if (Sentry) {
  app.use(Sentry.Handlers.errorHandler());
}

app.use(handle_error);

app.listen(process.env.PORT);

process.on('unhandledRejection', shut_down);
