
const axios = require('axios');
const config = require('../../../config');
const baseUrl = `${config.saveService.host}:${config.saveService.port}/saved_applications`;
const encodeEmail = email => Buffer.from(email).toString('hex');
const NotifyClient = require('notifications-node-client').NotifyClient;
const notifyApiKey = config.govukNotify.notifyApiKey;
const notifyClient = new NotifyClient(notifyApiKey);
const templateId = config.govukNotify.userAuthTemplateId;
const tokenGenerator = require('../../../db/save-token');
const _ = require('lodash');

const getPersonalisation = (host, token) => {
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return {
    // pass in `&` at the end in case there is another
    // query e.g. ?hof-cookie-check
    link: `${protocol}://${host + config.login.appPath}?token=${token}`,
    host: `${protocol}://${host}`
  };
};

module.exports = superclass => class extends superclass {
  skipEmailVerification(email) {
    if (email) {
      // eslint-disable-next-line no-param-reassign
      email = email.toLowerCase();
    }
    return config.login.allowSkip && email === config.login.skipEmail;
  }

  // fork to error page when an email domain is not recognised
  getNextStep(req, res) {

    const email = req.form.values['user-email'];

    if (this.skipEmailVerification(email)) {
      return res.redirect(`${config.login.appPath}?token=skip`);
    }

    return super.getNextStep(req, res);
  }
  async validate(req, res, next) {
    try {
      const userEmail = req.form.values['user-email'].toLowerCase();
      const uan = req.sessionModel.get('uan');
    
      const response = await axios.get(baseUrl + '/uan/'  +  uan);
      const claimantRecords = response.data
      const recordEmail = claimantRecords.map(r => {
        return r.email
      });

      if (!recordEmail.includes(userEmail) ) {
        return next({
          'user-email': new this.ValidationError(
            'user-email',
            {
              type: 'noEmailRecordMatch',
              redirect: undefined
            }
          )
        });
      }
    } catch (e) {
      return next(e);
    }
    return super.validate(req, res, next);
  }

  async saveValues(req, res, next) {
    const host = config.serviceUrl || req.get('host');
    let email;

    if (req.form.values['user-email']) {
      email = req.form.values['user-email'].toLowerCase();
    } else if (req.sessionModel.get('user-email')) {
      email = req.sessionModel.get('user-email').toLowerCase();
    }

    if (this.skipEmailVerification(email)) {
      return super.saveValues(req, res, next);
    }

    const token = tokenGenerator.save(email);

    try {
      await notifyClient.sendEmail(templateId, email, {
        personalisation: getPersonalisation(host, token)
      });
    } catch (e) {
      const err = _.get(e, 'response.data.errors[0].message', e);
      const msg = 'Can’t send to this recipient using a team-only API key';

      if (err === msg) {
        return res.redirect('/verify/team-email-invalid');
      }
      return next(e);
    }

    return super.saveValues(req, res, next);
  }
};
