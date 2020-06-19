// Set the process name for use in the stop script
require('process').title = 'impeach';

const eboard = require('./data/eboard.json');

// Pull in environment variables
require('dotenv').config();

// Define and connect to database
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  const evalSchema = mongoose.Schema({
    name: String,
    eboard: [String],
    likes: String,
    dislikes: String,
    comments: String,
  });
  const parseEboard = (dir) => eboard[dir] || dir;
  evalSchema.methods.pretty_print = function () {
    return `Evaluation for ${this.eboard.map(parseEboard).join(', ')}:
Likes: ${this.likes}
Dislikes: ${this.dislikes}
Comments: ${this.comments}
${this.name ? `From: ${this.name}` : ''}`;
  };
  const content_block = (title, content) => {
    return !content
      ? []
      : [
          { type: 'divider' },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${title}*`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: content,
            },
          },
        ];
  };
  evalSchema.methods.block_format = function () {
    return {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'plain_text',
            text: "Hello :eboard:\nHere's a new Eboard Eval.",
            emoji: true,
          },
        },
      ],
      attachments: [
        {
          color: '#b0197e',
          blocks: [
            ...content_block(
              'Directorships',
              this.eboard.map(parseEboard).join(', ')
            ),
            ...content_block('Likes', this.likes),
            ...content_block('Dislikes', this.dislikes),
            ...content_block('Comments', this.comments),
          ],
        },
      ],
    };
  };

  Open = mongoose.model('Open', evalSchema);
  Archive = mongoose.model('Archive', evalSchema);
});

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
    function (accessToken, refreshToken, profile, cb) {
      return cb(null, profile);
    }
  )
);

// Configure Passport authenticated session persistence.
passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

// Create a new Express application.
const express = require('express');
const app = express();
const axios = require('axios');

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
  function (req, res) {
    res.redirect(req.session.returnTo);
  }
);

// Require login
app.use(require('connect-ensure-login').ensureLoggedIn());

// Pull git revision for display
const git = require('git-rev');
let rev = 'GitHub';
let gitUrl = 'https://github.com/mxmeinhold/impeach';
git.short(function (commit) {
  gitUrl = gitUrl + '/tree/' + commit;
  rev = commit;
});

// Set the templating engine
app.set('view engine', 'pug');
app.set('views', './src/views');

// Static assets
app.use(express.static('static'));

function getUser(req) {
  const { preferred_username, given_name, groups } = req.user._json;
  return {
    eboard: groups.includes('rtp'), // TODO
    profileImage: `https://profiles.csh.rit.edu/image/${preferred_username}`,
    name: `${given_name} (${preferred_username})`,
  };
}

app.get('/', function (req, res) {
  res.render('index', {
    gitUrl: gitUrl,
    gitRev: rev,
    eboard: eboard,
    alerts: [],
    user: getUser(req),
  });
});

const body2openEval = (body) => {
  const submission = new Open({
    name: (body.name && body.name.trim()) || '',
    eboard: body.eboard,
    likes: (body.likes && body.likes.trim()) || '',
    dislikes: (body.dislikes && body.dislikes.trim()) || '',
    comments: (body.comments && body.comments.trim()) || '',
  });
  if (submission.likes || submission.dislikes || submission.comments) {
    return submission;
  }
};

app.post('/', function (req, res) {
  const submission = body2openEval(req.body);
  if (!submission) {
    res.render('index', {
      gitUrl: gitUrl,
      gitRev: rev,
      eboard: eboard,
      alerts: [
        {
          message: 'Empty submission, eval not recorded',
          attributes: {
            class: 'alert-warning',
            role: 'alert',
          },
        },
      ],
      user: getUser(req),
    });
  } else {
    const alerts = [];
    submission.save((err, submission) => {
      if (err) {
        alerts.push({
          message: 'Something went wrong, sorry. Eval not submitted',
          attributes: {
            class: 'alert-danger',
            role: 'alert',
          },
        });
      } else {
        alerts.push({
          message: 'Eval Submitted',
          attributes: {
            class: 'alert-primary',
            role: 'alert',
          },
        });
        process.env.SLACK_URI &&
          axios
            .post(process.env.SLACK_URI, {
              text: submission.pretty_print(),
              ...submission.block_format(),
            })
            .catch(function (error) {
              console.log(error); // TODO
            });
      }
      res.render('index', {
        gitUrl: gitUrl,
        gitRev: rev,
        eboard: eboard,
        alerts: alerts,
        user: getUser(req),
      });
    });
  }
});

app.listen(process.env.PORT);
