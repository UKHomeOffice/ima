/* eslint-disable camelcase */
const axios = require('axios');
const moment = require('moment');
const config = require('../../../config');
const Bottleneck = require('bottleneck');
const NotifyClient = require('notifications-node-client').NotifyClient;
const notifyApiKey = config.govukNotify.notifyApiKey;
const notifyClient = new NotifyClient(notifyApiKey);

const applicationsUrl = `${config.saveService.host}:${config.saveService.port}/saved_applications`;
const recruitersUrl = `${config.saveService.host}:${config.saveService.port}/recruiters`;

const encodeEmail = email => Buffer.from(email).toString('hex');
const expiresAtDate = date => moment(date).format('Do MMMM');

const limiter = new Bottleneck({
  maxConcurrent: 50,
  minTime: 1000
});

const grsSsclToCandidateTemplateId = config.govukNotify.grsSsclToCandidateTemplateId;
const recruiterTemplateId = config.govukNotify.grsSsclConfirmCandidatesTemplateId;
const caseworkersTemplateId = config.govukNotify.caseworkersConfirmCandidatesTemplateId;
const caseworkersEmailInbox = config.govukNotify.caseworkersEmailInbox;

module.exports = superclass => class extends superclass {
  async saveValues(req, res, next) {
    let recruiterEmail = req.sessionModel.get('recruiter-email');
    const sharedMailbox = req.form.values['shared-mailbox'];
    if (sharedMailbox) {
      req.sessionModel.set('recruiter-email', sharedMailbox);
      recruiterEmail = sharedMailbox;
    }
    const records = req.sessionModel.get('bulk-records');
    const host = config.serviceUrl || req.get('host');
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const serviceUrl = `${protocol}://${host}`;

    try {
      let recruiterResult = await axios.get(recruitersUrl + '/email/' + encodeEmail(recruiterEmail));
      let recruiterRecord = recruiterResult.data;

      if (!recruiterRecord.length) {
        recruiterResult = await axios.post(recruitersUrl, { email: recruiterEmail });
        recruiterRecord = recruiterResult.data;
      }

      const expiryDates = await limiter.schedule(() => {
        const submitRecords = records.map(record => {
          return this.submitRecord(recruiterRecord[0], record, serviceUrl);
        });
        return Promise.all(submitRecords);
      });
      // these will be all the same but allows us to grab one for the notifications
      const expiry = expiryDates[0];

      const applications = records.map(record => {
        return `• ${record.name} - ${record['email address']} - ${record['applicant id'] || record['job role']}`;
      }).join('\n');

      await this.sendGrsSsclEmail(applications, expiry, recruiterEmail);
      await this.sendCaseworkersEmail(applications, expiry);

      return super.saveValues(req, res, next);
    } catch (e) {
      return next(e);
    }
  }

  async sendGrsSsclEmail(applicants, expiry_date, recruiter_email) {
    return await notifyClient.sendEmail(recruiterTemplateId, recruiter_email, {
      personalisation: {
        applicants,
        expiry_date
      }
    });
  }

  async sendCaseworkersEmail(applicants, expiry_date) {
    return await notifyClient.sendEmail(caseworkersTemplateId, caseworkersEmailInbox, {
      personalisation: {
        applicants,
        expiry_date
      }
    });
  }

  async submitRecord(recruiterRecord, record, serviceUrl) {
    if (record['email address']) {
      const response = await axios.post(applicationsUrl, {
        applicant_id: record['applicant id'],
        recruiter_id: recruiterRecord.id,
        email: record['email address'].toLowerCase(),
        session: JSON.stringify({}),
        job_role: record['job role']
      });

      const expiry_date = expiresAtDate(response.data[0].expires_at);

      await notifyClient.sendEmail(grsSsclToCandidateTemplateId, record['email address'], {
        personalisation: {
          applicant_email: record['email address'],
          expiry_date,
          service_url: serviceUrl,
          recruiter_email: recruiterRecord.email
        }
      });

      return Promise.resolve(expiry_date);
    }
    return null;
  }
};
