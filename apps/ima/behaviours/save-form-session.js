
const axios = require('axios');
const config = require('../../../config');
const _ = require('lodash');

const patchUrl = id => `${config.saveService.host}:${config.saveService.port}/saved_applications/${id}`;

module.exports = superclass => class extends superclass {
  saveValues(req, res, next) {
    return super.saveValues(req, res, err => {
      if (err) {
        return next(err);
      }

      // remove csrf secret and errors from session data to prevent CSRF Secret issues in the session
      const session = req.sessionModel.toJSON();
      delete session['csrf-secret'];
      delete session.errors;
      delete session['valid-token'];
      delete session['user-cases'];

      if (session.steps.indexOf(req.path) === -1) {
        session.steps.push(req.path);
      }
      // ensure no /edit steps are add to the steps property when we save to the store
      session.steps = session.steps.filter(step => !step.match(/\/change|edit$/));

      // skip requesting data service api when running in local and test mode
      if (config.env === 'local' || config.env === 'test') {
        return next();
      }

      req.log('info', `Saving Form Session: ${req.sessionModel.get('id')}`);

      const id = req.sessionModel.get('id');

      return axios.patch(patchUrl(id), { session }, {
        headers: {'content-type': 'application/json'}
      }).then(response => {
        const resBody = response.data;
        // if a record exists the response should contain the entry otherwise it has been deleted/expired
        if (!resBody.length) {
          return res.redirect('/ima/application-expired');
        }

        if (resBody && resBody.length && resBody[0].id) {
          req.sessionModel.set('id', resBody[0].id);
        } else {
          req.sessionModel.unset('id');
        }

        if (req.body['save-and-exit']) {
          return res.redirect('/ima/save-and-exit');
        }

        const isContinueOnEdit = req.form.options.continueOnEdit;

        const loopedForkCondition = _.get(req.form.options.forks, '[0].condition.value');
        const loopedForkField = _.get(req.form.options.forks, '[0].condition.field');
        const loopedFieldMatchesForkCondition = loopedForkField &&
          req.form.values[loopedForkField] === loopedForkCondition;

        if (req.sessionModel.get('redirect-to-current-progress') &&
          !isContinueOnEdit && !loopedFieldMatchesForkCondition) {
          return res.redirect('/ima/current-progress');
        }

        return next();
      }).catch(next);
    });
  }
};
