// Pull in environment variables
require('dotenv').config();

// Define and connect to database
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  const evalSchema = mongoose.Schema({ // eslint-disable-line new-cap
    name: String,
    eboard: String,
    likes: String,
    dislikes: String,
    comments: String,
    responses: Number
  });

  Open = mongoose.model('Open', evalSchema);
  Archive = mongoose.model('Archive', evalSchema);
});

// Configure the OpenID Connect strategy for use by Passport.
const passport = require('passport');
const Strategy = require('passport-openidconnect').Strategy;
passport.use(new Strategy({
  issuer: 'https://sso.csh.rit.edu/auth/realms/csh',
  authorizationURL: 'https://sso.csh.rit.edu/auth/realms/csh/protocol/openid-connect/auth',
  tokenURL: 'https://sso.csh.rit.edu/auth/realms/csh/protocol/openid-connect/token',
  userInfoURL: 'https://sso.csh.rit.edu/auth/realms/csh/protocol/openid-connect/userinfo',
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: 'http://' + process.env.HOST + '/login/callback',
},
function(accessToken, refreshToken, profile, cb) {
  return cb(null, profile);
}));


// Configure Passport authenticated session persistence.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


// Create a new Express application.
const express = require('express');
const app = express();

// Configure body parsing
app.use(require('body-parser'));

// Configure session handling
app.use(require('express-session')({
  secret: process.env.EXPRESS_SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}));

// Initialize Passport and restore authentication state from the session.
app.use(passport.initialize());
app.use(passport.session());

// Authentication: authenticates with CSH OIDC and returns to origin point
app.get('/login',
    passport.authenticate('openidconnect'));

app.get('/login/callback',
    passport.authenticate('openidconnect', {failureRedirect: '/login'}),
    function(req, res) {
      res.redirect(req.session.returnTo);
    });

// Require login
app.use(require('connect-ensure-login').ensureLoggedIn());

// Pull git revision for display
const git = require('git-rev');
let rev = 'GitHub';
let gitUrl = 'https://github.com/mxmeinhold/impeach';
git.short(function(commit) {
  gitUrl = gitUrl + '/tree/' + commit;
  rev = commit;
});
console.log(rev);

// Set the templating engine
app.set('view engine', 'pug');
app.set('views', './views');

app.get('/', function(req, res) {
  res.render('index', {gitUrl: gitUrl, gitRev: rev});
});

app.get('/submit', function(req, res) {
  console.log(req.body);
  res.render('submit', {gitUrl: gitUrl, gitRev: rev});
});

app.listen(process.env.PORT);
