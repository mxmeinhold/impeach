const axios = require('axios');
const db = require('./db.js');
const eboard = require('./data/eboard.json');
const { Err } = require('./error.js');
const { getUser, rev, gitUrl, is_prod } = require('./util.js');

const body2openEval = (body) => {
  const submission = new Open({
    name: (body.name && body.name.trim()) || '',
    eboard: body.eboard,
    likes: (body.likes && body.likes.trim()) || '',
    dislikes: (body.dislikes && body.dislikes.trim()) || '',
    comments: (body.comments && body.comments.trim()) || '',
    date: new Date(),
  });
  if (submission.likes || submission.dislikes || submission.comments) {
    return submission;
  }
};

const root_get = (req, res) => {
  res.render('index', {
    gitUrl: gitUrl,
    gitRev: rev,
    eboard: eboard,
    alerts: [],
    user: getUser(req),
  });
};

const current_evals_get = (req, res, next) => {
  const user = getUser(req);
  if (!user.eboard && is_prod) {
    next(new Err('Permission denied', 403));
  } else {
    Open.find((err, subs) => {
      if (err) {
        next(err);
      }
      res.render('current-evals', {
        gitUrl: gitUrl,
        gitRev: rev,
        eboard: eboard,
        alerts: [],
        user: getUser(req),
        submissions: subs,
      });
    });
  }
};
const root_submit = (req, res) => {
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
            .catch((error) => {
              console.log('ERROR: failed to send to slack');
              console.log(error);
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
};

const archive_get = (req, res, next) => {
  const user = getUser(req);
  if (!user.eboard && is_prod) {
    next(new Err('Permission denied', 403));
  } else {
    Archive.find((err, subs) => {
      if (err) {
        next(err);
      }
      res.render('archive', {
        gitUrl: gitUrl,
        gitRev: rev,
        eboard: eboard,
        alerts: [],
        user: getUser(req),
        submissions: subs,
      });
    });
  }
};

const delet = (req, res, next) => {
  const id = req.params.id;
  Open.findById(id, (err, open) => {
    if (err) {
      next(err);
    } else {
      new Archive({
        _id: open._id,
        name: open.name,
        likes: open.likes,
        dislikes: open.dislikes,
        comments: open.comments,
        eboard: open.eboard,
        date: open.date,
      }).save((err, archive) => {
        if (err) {
          next(err);
        } else {
          Open.deleteOne({ _id: id }, (err, deleted) => {
            if (err) {
              Archive.deleteOne({ _id: archive._id }, (err, archive_delete) => {
                /* At this point we don't care anymore*/
              });
              next(err);
            } else {
              res.status(200).json({ deleted: true });
            }
          });
        }
      });
    }
  });
};

module.exports = {
  root_get: root_get,
  current_evals_get: current_evals_get,
  root_submit: root_submit,
  archive_get: archive_get,
  delet: delet,
};
