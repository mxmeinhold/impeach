const { getUser, rev, gitUrl, is_prod } = require('./util.js');
console.log(is_prod);
class Err extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const err_404 = (req, res, next) => {
  next(new Err(`Not found`, 404));
};

const handle_error = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode);
  const message = statusCode === 500 ? 'Something went wrong' : err.message;
  if (is_prod) {
    res.format({
      html: () => {
        res.render('err', {
          status: statusCode,
          message: message,
          url: req.url,
          gitUrl: gitUrl,
          gitRev: rev,
          user: getUser(req),
        });
      },
      json: () => {
        res.json({ error: message });
      },
      text: () => {
        // Fall back to plaintext
        res.type('txt').send(`Error ${statusCode}: ${message}`);
      },
      default: () => {
        res.status(406).send('Not Acceptable');
      },
    });
  } else {
    res.json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
};

module.exports = {
  Err: Err,
  handle_error: handle_error,
  err_404,
};
