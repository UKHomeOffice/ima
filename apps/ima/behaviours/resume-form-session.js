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
    // reset session but keeping login fields, csrf and preexisting reports garnered from API
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
    const reports = req.sessionModel.get('user-cases');
    const report = reports.find(obj => obj.applicant_id === req.form.values['uan']) ||
      reports.find(obj => obj.job_role && obj.job_role.replace(/\s/g, '-') === req.form.values['uan']);
    this.setupSession(req, report);
    req.sessionModel.set('multipleCases', true);

    return super.saveValues(req, res, next);
  }

  createLabel(uan) {
    if (uan ) return `UAN: ${uan}`;
  }

  setupRadioButtons(req, reports) {
    const reportsButtons = reports.map(obj => {
      const uan = obj.uan;
      return {
        label: this.createLabel(uan),
        value: uan,
        useHintText: true,
        hint: `Submit by ${moment(obj.expires_at).format('Do MMMM')}`
      };
    });

    req.form.options.fields['uan'] = {
      mixin: 'radio-group',
      isPageHeading: true,
      validate: ['required'],
      options: _.sortBy(reportsButtons, obj => obj.value)
    };
  }

  setupSession(req, report) {
    let session;

    const reportDBprops = {
      id: report.id,
      'uan': report.uan,
      'caseworker-id': report.caseworker_id,
      'report-created-at': report.created_at,
      'report-expires-at': report.expires_at,
      'user-cases': req.sessionModel.get('user-cases')
    };

    req.sessionModel.set(reportDBprops);

    try {
      session = JSON.parse(report.session);
    } catch(e) {
      session = report.session;
    }
    // do not overwrite session if session in the DB is empty, i.e. new case
    if (_.isEmpty(session)) {
      return;
    }

    // ensure no /edit steps are add to the steps property when session resumed
    session.steps = session.steps.filter(step => !step.match(/\/change|edit$/));

    delete session['csrf-secret'];
    delete session.errors;

    req.sessionModel.set(Object.assign({}, session, reportDBprops));
  }
};

