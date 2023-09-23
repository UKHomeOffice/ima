/* eslint-disable consistent-return */

const axios = require('axios');
const moment = require('moment');
const config = require('../../../config');
const baseUrl = `${config.saveService.host}:${config.saveService.port}/saved_applications/email/`;
const _ = require('lodash');

const encodeEmail = email => Buffer.from(email).toString('hex');

const SESSION_DEFAULTS = config.sessionDefaults;

module.exports = superclass => class extends superclass {
  cleanSession(req) {
    let cleanList = Object.keys(req.sessionModel.attributes);
    cleanList = cleanList.filter(item => SESSION_DEFAULTS.fields.indexOf(item) === -1);

    req.sessionModel.unset(cleanList);
    req.sessionModel.set('steps', SESSION_DEFAULTS.steps);
  }
  // GET lifecycle
  configure(req, res, next) {
    // reset session but keeping login fields, csrf and preexisting cases garnered from API
    this.cleanSession(req);
    // skip requesting data service api when running in local and test mode
    if (config.env === 'local' || config.env === 'test') {
      return super.configure(req, res, next);
    }

    return this.getCases(req, res, next);
  }

  getCases(req, res, next) {
    const email = req.sessionModel.get('user-email');

    return axios.get(baseUrl + encodeEmail(email))
      .then(response => {
        const cases = response.data;
        const isSingleCase = cases.length < 2;

        if (!cases.length) {
          return res.redirect('/ima/no-cases-found');
        }

        if (isSingleCase) {
          this.setupSession(req, cases[0]);
          req.sessionModel.set('multipleCases', false);
          return res.redirect(super.getNextStep(req, res, next));
        }

        req.sessionModel.set('user-cases', cases);

        this.setupRadioButtons(req, cases);

        return super.configure(req, res, next);
      })
      .catch(next);
  }

  // POST lifecycle
  saveValues(req, res, next) {
    const cases = req.sessionModel.get('user-cases');
    const uanCase = cases.find(obj => obj.uan === req.form.values.uan);
    this.setupSession(req, uanCase);
    req.sessionModel.set('multipleCases', true);

    return super.saveValues(req, res, next);
  }

  createLabel(uan) {
    if (uan) return `UAN: ${uan}`;
  }

  setupRadioButtons(req, cases) {
    const casesButtons = cases.map(obj => {
      const uan = obj.uan;
      return {
        label: this.createLabel(uan),
        value: uan,
        useHintText: true,
        hint: `Date of birth: ${moment(obj.date_of_birth).format('DD/MM/YYYY')}`
      };
    });

    req.form.options.fields.uan = {
      mixin: 'radio-group',
      isPageHeading: true,
      validate: ['required'],
      options: _.sortBy(casesButtons, obj => obj.value)
    };
  }

  setupSession(req, uanCase) {
    let session;

    const caseDBprops = {
      id: uanCase.id,
      uan: uanCase.uan,
      'caseworker-id': uanCase.caseworker_id,
      'uanCase-created-at': uanCase.created_at,
      'uanCase-expires-at': uanCase.expires_at,
      'user-cases': req.sessionModel.get('user-cases')
    };

    req.sessionModel.set(caseDBprops);

    try {
      session = JSON.parse(uanCase.session);
    } catch (e) {
      session = uanCase.session;
    }
    // do not overwrite session if session in the DB is empty, i.e. new case
    if (_.isEmpty(session)) {
      return;
    }

    // ensure no /edit steps are add to the steps property when session resumed
    session.steps = session.steps.filter(step => !step.match(/\/change|edit$/));

    delete session['csrf-secret'];
    delete session.errors;

    req.sessionModel.set(Object.assign({}, session, caseDBprops));
  }
};
