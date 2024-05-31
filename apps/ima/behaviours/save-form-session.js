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

        const sessionSteps = req.sessionModel.get('steps');
        const formSteps = Object.keys(req.form.options.steps);
        const orderedSessionSteps = formSteps.filter(step => sessionSteps.includes(step));
        const latestStepInJourney = orderedSessionSteps[orderedSessionSteps.length - 1];

        // logic to override the routing of the SIH section
        if(req.form.options.route === '/harm-claim' &&
        req.sessionModel.get('is-serious-and-irreversible') === 'yes' &&
        req.sessionModel.get('sih-countries') !== undefined) {
          if(req.sessionModel.get('sih-countries').aggregatedValues.length === 5) {
            return res.redirect('/ima/harm-claim-summary');
          }
          return res.redirect('/ima/harm-claim-countries');
        } else if(req.form.options.route === '/harm-claim-countries' ||
        req.form.options.route.includes('/risk-of-harm') ||
        req.form.options.route.includes('/harm-claim-details')) {
          return next();
        } else if(req.form.options.route.includes('/harm-claim-summary')) {
          if(req.sessionModel.get('steps').includes('/evidence-upload')) {
            return res.redirect('/ima/final-summary');
          } else if(!req.sessionModel.get('steps').includes('/human-rights-claim')) {
            return res.redirect('/ima/human-rights-claim');
          }
          return res.redirect('/ima/' + latestStepInJourney);
        } else if (req.form.options.route === '/harm-claim' &&
        req.sessionModel.get('is-serious-and-irreversible') === 'no') {
          if(req.sessionModel.get('steps').includes('/evidence-upload')) {
            return res.redirect('/ima/final-summary');
          }
          return next();
        }

        // logic to override the routing of the human rights section
        if(req.form.options.route === '/human-rights-claim' &&
        req.sessionModel.get('human-rights-claim') === 'no') {
          if(req.sessionModel.get('steps').includes('/other-human-rights-claims')) {
            return res.redirect('/ima/other-human-rights-claims');
          } return next();
        } else if(req.form.options.route === '/human-rights-family') {
          return next();
        } else if(req.form.options.route === '/human-rights-family-summary') {
          return res.redirect('/ima/other-human-rights-claims');
        } else if(req.form.options.route === '/other-human-rights-claims' &&
        req.sessionModel.get('steps').includes('/exceptional-circumstances-claim')) {
          return res.redirect('/ima/final-summary');
        }

        // Redirect to final-summary if on the edit flow of the other-human-rights-claims page
        if((req.sessionModel.get('steps')[req.sessionModel.get('steps').length - 1] === '/human-rights-family-summary'
        || req.sessionModel.get('steps')[req.sessionModel.get('steps').length - 1] === '/human-rights-claim' ) &&
        req.form.options.continueOnEdit === false &&
        req.sessionModel.get('steps').includes('/exceptional-circumstances-claim')) {
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
