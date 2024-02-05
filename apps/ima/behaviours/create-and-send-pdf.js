
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const axios = require('axios');
const config = require('../../../config');
const utilities = require('../../../lib/utilities');
const _ = require('lodash');
const NotifyClient = utilities.NotifyClient;
const PDFModel = require('hof').apis.pdfConverter;

const submissionTemplateId = config.govukNotify.submissionTemplateId;
const submissionFailedTemplateId = config.govukNotify.submissionFailedTemplateId;
const customerReceiptTemplateId = config.govukNotify.customerReceiptTemplateId;
const caseworkerEmail = config.govukNotify.caseworkerEmail;
const notifyKey = config.govukNotify.notifyApiKey;
const dateTimeFormat = config.dateTimeFormat;
const baseUrl = `${config.saveService.host}:${config.saveService.port}/saved_applications`;

const notifyClient = new NotifyClient(notifyKey);

module.exports = class CreateAndSendPDF {
  constructor(behaviourConfig) {
    this.behaviourConfig = behaviourConfig;
  }

  readCss() {
    return new Promise((resolve, reject) => {
      const cssFile = path.resolve(__dirname, '../../../public/css/app.css');
      fs.readFile(cssFile, (err, data) => err ? reject(err) : resolve(data));
    });
  }

  readHOLogo() {
    return new Promise((resolve, reject) => {
      const hoLogoFile = path.resolve(__dirname, '../../../assets/images/ho-logo.png');
      fs.readFile(hoLogoFile, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(`data:image/png;base64,${data.toString('base64')}`);
      });
    });
  }

  async renderHTML(req, res, locs) {
    let locals = locs;

    if (this.behaviourConfig.sortSections) {
      locals = this.sortSections(locs);
    }

    locals.title = 'IMA Submission';
    locals.dateTime = moment().format(dateTimeFormat);
    locals.values = req.sessionModel.toJSON();
    locals.htmlLang = res.locals.htmlLang || 'en';

    locals.css = await this.readCss(req);
    locals['ho-logo'] = await this.readHOLogo();
    return new Promise((resolve, reject) => {
      res.render('pdf.html', locals, (err, html) => err ? reject(err) : resolve(html));
    });
  }

  async sendEmailWithAttachment(req, pdfData) {
    const personalisations = this.behaviourConfig.notifyPersonalisations;

    try {
      if (notifyKey === 'USE_MOCK') {
        req.log('warn', '*** Notify API Key set to USE_MOCK. Ensure disabled in production! ***');
      }
      const imageNames = req.sessionModel.get('images') ?
        req.sessionModel.get('images').map(o => `• ${o.name}\n  ${o.url}`).join('\n') : '';

      await notifyClient.sendEmail(submissionTemplateId, caseworkerEmail, {
        personalisation: Object.assign({}, personalisations, {
          link_to_file: notifyClient.prepareUpload(pdfData, { confirmEmailBeforeDownload: false }),
          has_supporting_documents: _.get(req.sessionModel.get('images'), 'length') ? 'yes' : 'no',
          supporting_documents: imageNames
        })
      });

      const trackedPageStartTime = Number(req.sessionModel.get('session.started.timestamp'));
      const timeSpentOnForm = utilities.secondsBetween(trackedPageStartTime, new Date());

      req.log('info', 'ima.submit_form.create_email_with_file_notify.successful');
      req.log('info', `ima.submission.duration=[${timeSpentOnForm}] seconds`);

      return await this.notifyByEmail(req, pdfData);
    } catch (err) {
      const error = _.get(err, 'response.data.errors[0]', err.message || err);
      req.log('error', 'ima.submit_form.create_email_with_file_notify.error', error);
      throw new Error(error);
    }
  }

  async notifyByEmail(req, pdfData) {
    if (!this.behaviourConfig.sendReceipt) {
      return Promise.resolve();
    }
    const userEmail = req.sessionModel.get('user-email');
    const userFormEmail = req.sessionModel.get('email-address-details');
    const advisorEmail = req.sessionModel.get('legal-representative-email');
    const allUniqueEmails = _.uniq([userEmail, userFormEmail, advisorEmail].filter(e => e));

    try {
      const sendAllEmails = allUniqueEmails.map(email => this.sendEmail(req, email, pdfData));

      return Promise.all(sendAllEmails)
        .then(() => req.log('info', 'ima.send_receipt.create_email_notify.successful'))
        .catch(e => {
          throw e;
        });
    } catch (err) {
      req.log('error', 'ima.send_receipt.create_email_notify.error', err.message || err);
      throw err;
    }
  }

  async send(req, res, locals) {
    try {
      const html = await this.renderHTML(req, res, locals);

      const pdfModel = new PDFModel();
      pdfModel.set({ template: html });
      const pdfData = await pdfModel.save();

      await this.sendEmailWithAttachment(req, pdfData);

      req.log('info', 'ima.form.submit_form.successful');
      const id = req.sessionModel.get('id');

      return await axios.patch(`${baseUrl}/${id}`, { submitted_at: moment().format('YYYY-MM-DD HH:mm:ss') });
    } catch (e) {
      req.log('error', 'ima.form.submit_form.failed');
      return await this.sendSubmissionFailure(req);
    }
  }

  async sendEmail(req, email, pdfData) {
    const imageNames = req.sessionModel.get('images') ?
      req.sessionModel.get('images').map(o => `• ${o.name}\n  ${o.url}`).join('\n') : '';

    return notifyClient.sendEmail(customerReceiptTemplateId, email, {
      personalisation: Object.assign({}, {
        link_to_file: config.env !== 'production' ?
          notifyClient.prepareUpload(pdfData, { confirmEmailBeforeDownload: false }) :
          notifyClient.prepareUpload(pdfData),
        has_supporting_documents: _.get(req.sessionModel.get('images'), 'length') ? 'yes' : 'no',
        supporting_documents: imageNames
      })
    });
  }

  async sendSubmissionFailure(req) {
    return notifyClient.sendEmail(submissionFailedTemplateId, req.sessionModel.get('user-email'), {
      personalisation: {
        uan: req.sessionModel.get('uan')
      }
    });
  }

  sortSections(locals) {
    const translations = require('../translations/src/en/pages.json');
    const sectionHeaders = Object.values(translations.confirm.sections);
    const orderedSections = _.map(sectionHeaders, obj => obj.header);
    let rows = locals.rows;

    rows = rows.slice().sort((a, b) => orderedSections.indexOf(a.section) - orderedSections.indexOf(b.section));

    locals.rows = rows;
    return locals;
  }
};
