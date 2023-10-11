/* eslint-disable camelcase */
const axios = require('axios');
const moment = require('moment');
const config = require('../../../config');
const Bottleneck = require('bottleneck');
const NotifyClient = require('notifications-node-client').NotifyClient;
const notifyApiKey = config.govukNotify.notifyApiKey;
const notifyClient = new NotifyClient(notifyApiKey);

const applicationsUrl = `${config.saveService.host}:${config.saveService.port}/saved_applications`;
const caseworkersUrl = `${config.saveService.host}:${config.saveService.port}/caseworkers`;

const encodeEmail = email => Buffer.from(email).toString('hex');
const expiresAtDate = date => moment(date).format('Do MMMM');

const limiter = new Bottleneck({
  maxConcurrent: 50,
  minTime: 1000
});

// const caseworkersTemplateId = config.govukNotify.caseworkersConfirmClaimantsTemplateId;
// const caseworkersEmailInbox = config.govukNotify.caseworkersEmailInbox;

module.exports = superclass => class extends superclass {
  async saveValues(req, res, next) {
    let caseworkerEmail = req.sessionModel.get('caseworker-email');
    const sharedMailbox = req.form.values['shared-mailbox'];
    if (sharedMailbox) {
      req.sessionModel.set('caseworker-email', sharedMailbox);
      caseworkerEmail = sharedMailbox;
    }
    const records = req.sessionModel.get('bulk-records');
    const host = config.serviceUrl || req.get('host');
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const serviceUrl = `${protocol}://${host}`;

    try {
      let caseworkerResult = await axios.get(caseworkersUrl + '/email/' + encodeEmail(caseworkerEmail));
      let caseworkerRecord = caseworkerResult.data;

      if (!caseworkerRecord.length) {
        caseworkerResult = await axios.post(caseworkersUrl, { email: caseworkerEmail });
        caseworkerRecord = caseworkerResult.data;
      }

      const expiryDates = await limiter.schedule(() => {
        const submitRecords = records.map(record => {
          return this.submitRecord(caseworkerRecord[0], record, serviceUrl);
        });
        return Promise.all(submitRecords);
      });
      // these will be all the same but allows us to grab one for the notifications
      const expiry = expiryDates[0];

      const applications = records.map(record => {
        return `• ${record.uan} - ${record['date of birth']} - ${record['email address']}`;
      }).join('\n');

      // await this.sendCaseworkersEmail(applications, expiry);

      return super.saveValues(req, res, next);
    } catch (e) {
      return next(e);
    }
  }

  // async sendCaseworkersEmail(claimants, expiry_date) {
  //   return await notifyClient.sendEmail(caseworkersTemplateId, caseworkersEmailInbox, {
  //     personalisation: {
  //       claimants,
  //       expiry_date
  //     }
  //   });
  // }

  async submitRecord(caseworkerRecord, record, serviceUrl) {
    if (record['uan']) {
      const response = await axios.post(applicationsUrl, {
        uan: record['uan'],
        caseworker_id: caseworkerRecord.id,
        date_of_birth: moment(record['date of birth']).format('YYYY-MM-DD'),
        session: JSON.stringify({})
      });

      const expiry_date = expiresAtDate(response.data[0].expires_at);
      return Promise.resolve(expiry_date);
    }
    return null;
  }
};
