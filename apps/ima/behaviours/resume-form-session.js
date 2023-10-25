/* eslint-disable consistent-return */
'use strict';

const axios = require('axios');
const config = require('../../../config');
const moment = require('moment');
const baseUrl = `${config.saveService.host}:${config.saveService.port}/saved_applications/email/`;
const _ = require('lodash');

const encodeEmail = email => Buffer.from(email).toString('hex');

const SESSION_DEFAULTS = config.sessionDefaults;

module.exports = superclass => class extends superclass {
  cleanSession(req) {
    let cleanList = Object.keys(req.sessionModel.attributes);
    const leaveFields = SESSION_DEFAULTS.fields.concat(['csrf-secret', 'user-cases']);
    cleanList = cleanList.filter(item => leaveFields.indexOf(item) === -1);

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
        const sessionCases = req.sessionModel.get('user-cases') || [];
        const unsubmittedCases = _.filter(response.data, record => !record.submitted_at);
        const parsedBody = this.parseCasesSessions(unsubmittedCases);

        const cases = _.unionBy(parsedBody, sessionCases, 'id');

        const uan = req.sessionModel.get('uan');
        const singleCase = cases.length < 2;
        const isSameCase = _.get(cases, "[0].session['uan']") === uan;
        const noCaseOrSameCase = !cases[0] || isSameCase;
        const multipleCasesInSession = _.get(req.sessionModel.get('user-cases'), 'length') > 1;

        if (singleCase && noCaseOrSameCase && !multipleCasesInSession) {
          if (cases[0]) {
            this.setupSession(req, cases[0].session);
          }
          req.sessionModel.set('multipleCases', false);
          return res.redirect(super.getNextStep(req, res, next));
        }

        const filteredCases = this.addCasesToSession(req, cases, uan);
        this.setupRadioButtons(req, filteredCases);

        return super.configure(req, res, next);
      })
      .catch(next);
  }

  addCasesToSession(req, cases, uan) {
    const caseAlreadyInSession = cases.find(obj => obj.session.uan === uan);

    if (!caseAlreadyInSession) {
      this.addSessionCaseToList(req, cases);
    }

    const filteredCases = cases.filter(uanCase => {
      const isDuplicate = cases.filter(obj => {
        return obj.session.uan === uanCase.session.uan;
      }).length > 1;

      return uanCase.id || (!uanCase.id && !isDuplicate);
    });

    req.sessionModel.set('user-cases', filteredCases);
    return filteredCases;
  }

  addSessionCaseToList(req, cases) {
    const defaultSession = {
      session: Object.assign(...SESSION_DEFAULTS.fields.map(field => {
        return { [field]: req.sessionModel.get(field) };
      }))
    };
    defaultSession.session.steps = SESSION_DEFAULTS.steps;

    cases.push(defaultSession);
  }

  parseCasesSessions(body) {
    let cases = body;

    if (cases.length) {
      cases = cases.map(uanCase => {
        const session = uanCase.session;
        uanCase.session = typeof session === 'string' ?
          JSON.parse(session) : session;

        return uanCase;
      });
    }
    return cases;
  }
  // POST lifecycle
  saveValues(req, res, next) {
    const cases = req.sessionModel.get('user-cases');
    const uanCase = cases.find(obj => obj.session.uan === req.form.values.uan);

    if (uanCase) {
      req.sessionModel.set('id', uanCase.id);
    }

    this.setupSession(req, uanCase.session);
    req.sessionModel.set('multipleCases', true);

    return super.saveValues(req, res, next);
  }

  setupRadioButtons(req, cases) {
    req.form.options.fields.uan = {
      mixin: 'radio-group',
      isPageHeading: true,
      validate: ['required'],
      options: cases.map(obj => {
        const uan = obj.session.uan;
        const dob = obj.session['date-of-birth'];
        return {
          label: `UAN: ${uan}`,
          value: uan,
          useHintText: true,
          hint: `Date of birth ${moment(dob, 'YYYY-MM-DD').format('DD/MM/YYYY')}`
        };
      })
    };
  }

  setupSession(req, uanCase) {
    const session = uanCase;
    const cases = req.sessionModel.get('user-cases');
    // ensure no /edit steps are add to the steps property when session resumed
    session.steps = session.steps.filter(step => !step.match(/\/change|edit$/));

    delete session['csrf-secret'];
    delete session.errors;

    req.sessionModel.set(session);
    req.sessionModel.set('user-cases', cases);
  }
};
