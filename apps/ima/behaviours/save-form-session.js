/* eslint-disable camelcase */

const axios = require('axios');
const config = require('../../../config');
const _ = require('lodash');
const NotifyClient = require('notifications-node-client').NotifyClient;
const notifyApiKey = config.govukNotify.notifyApiKey;
const notifyClient = new NotifyClient(notifyApiKey);
const templateId = config.govukNotify.saveAndExitTemplateId;
const tokenGenerator = require('../../../db/save-token');
const utilities = require('../../../lib/utilities');
const applicationsUrl = `${config.saveService.host}:${config.saveService.port}/saved_applications`;

module.exports = superclass => class extends superclass {
  saveValues(req, res, next) {
    return super.saveValues(req, res, async err => {
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

      const id = req.sessionModel.get('id');
      const email = req.sessionModel.get('user-email');
      const cepr = req.sessionModel.get('cepr');
      const date_of_birth = req.sessionModel.get('date-of-birth');
      const duty_to_remove_alert = req.sessionModel.get('duty-to-remove-alert');

      req.log('info', `Saving Form Session: ${id}`);

      try {
        const response = await axios({
          url: id ? applicationsUrl + `/${id}` : applicationsUrl,
          method: id ? 'PATCH' : 'POST',
          data: id ? { session } : { session, email, cepr, date_of_birth, duty_to_remove_alert }
        });

        const resBody = response.data;

        if (resBody && resBody.length && resBody[0].id) {
          req.sessionModel.set('id', resBody[0].id);
        } else {
          req.sessionModel.unset('id');
        }

        if (req.body['save-and-exit']) {
          const host = req.get('host');
          const userEmail = req.form.values['user-email'] || req.sessionModel.get('user-email');
          const token = tokenGenerator.save(req, userEmail);
          try {
            await notifyClient.sendEmail(templateId, userEmail, {
              personalisation: utilities.getPersonalisation(host, token)
            });
          } catch (e) {
            return next(e);
          }
          return res.redirect('/ima/save-and-exit');
        }

        const isContinueOnEdit = req.form.options.continueOnEdit &&
          _.get(req.form.options.forks, '[0].continueOnEdit');
        // Redirect to final-summary if on the edit flow of the harm-claim page
        if((req.sessionModel.get('steps')[req.sessionModel.get('steps').length - 1] === '/harm-claim-summary'
        || req.sessionModel.get('steps')[req.sessionModel.get('steps').length - 1] === '/harm-claim' ||
        req.sessionModel.get('steps')[req.sessionModel.get('steps').length - 1] === '/harm-claim-countries' ||
        req.sessionModel.get('steps')[req.sessionModel.get('steps').length - 1].includes('/risk-of-harm') ||
        req.sessionModel.get('steps')[req.sessionModel.get('steps').length - 1].includes('/harm-claim-details')) &&
        (req.form.options.continueOnEdit === false || req.sessionModel.get('is-serious-and-irreversible') === 'no') &&
        req.sessionModel.get('steps').includes('/human-rights-claim')) {
          return res.redirect('/ima/final-summary');
        }

        const loopedForkCondition = _.get(req.form.options.forks, '[0].condition.value');
        const loopedForkField = _.get(req.form.options.forks, '[0].condition.field');
        const loopedFieldMatchesForkCondition = loopedForkField &&
          req.form.values[loopedForkField] === loopedForkCondition;

        if (req.sessionModel.get('redirect-to-summary') &&
          !isContinueOnEdit && !loopedFieldMatchesForkCondition) {
          return res.redirect('/ima/summary');
        }

        return next();
      } catch (e) {
        return next(e.response.data);
      }
    });
  }
};
