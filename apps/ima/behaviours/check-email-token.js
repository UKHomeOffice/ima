'use strict';
const getToken = require('../../../db/get-token');
const config = require('../../../config');
const _ = require('lodash');

/* eslint no-process-env: 0*/
module.exports = superclass => class extends superclass {
  saveValues(req, res, next) {
    const token = req.query.token;
    const skipEmail = config.login.skipEmail;
    const skipEmailAuth = token === 'skip' && config.login.allowSkip && skipEmail;
    const validEmailToken = req.sessionModel.get('valid-token') === true;
    const id = _.get(req.session['hof-wizard-verify'], 'cepr');
    // skips if it goes to /ima/start?token=skip
    // skips if a session is already present.
    if (skipEmailAuth && id) {
      req.sessionModel.set('valid-token', true);
      req.sessionModel.set('user-email', skipEmail);
      req.sessionModel.set('cepr', id);
      req.sessionModel.set('date-of-birth', _.get(req.session['hof-wizard-verify'], 'date-of-birth'));
      req.sessionModel.set('duty-to-remove-alert', _.get(req.session['hof-wizard-verify'], 'duty-to-remove-alert'));
      return super.saveValues(req, res, next);
    }

    if (validEmailToken) {
      return super.saveValues(req, res, next);
    }
    // returns a Promise
    return getToken.read(token)
      .then(user => {
        console.log("user: " + JSON.stringify(user));
        if (user.valid) {
          // this is so a user can go back without requesting a new token
          req.sessionModel.set('valid-token', true);
          // store email to send to caseworker later
          req.sessionModel.set('user-email', user.email);
          req.sessionModel.set('cepr', user.cepr);
          req.sessionModel.set('date-of-birth', user['date-of-birth']);
          req.sessionModel.set('duty-to-remove-alert', user['duty-to-remove-alert']);
          console.log("abc: " + req.sessionModel.get('duty-to-remove-alert'));
          return super.saveValues(req, res, next);
        }
        return res.redirect(config.login.invalidTokenPath);
      })
      .catch(err => req.log('info', `Check Token Error: ${err}`));
  }
};
