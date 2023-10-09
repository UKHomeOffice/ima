/* eslint-disable eqeqeq, no-eq-null */

const config = require('../../../config');
const NotifyClient = require('notifications-node-client').NotifyClient;
const notifyApiKey = config.govukNotify.notifyApiKey;
const notifyClient = new NotifyClient(notifyApiKey);
const templateId = config.govukNotify.userAuthTemplateId;
const axios = require('axios');
const baseUrl = `${config.saveService.host}:${config.saveService.port}/saved_applications`;
const tokenGenerator = require('../../../db/save-token');
const getPersonalisation = (host, token) => {
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return {
    // pass in `&` at the end in case there is another
    // query e.g. ?hof-cookie-check
    link: `${protocol}://${host + config.login.appPath}?token=${token}&`,
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

  async saveValues(req, res, next) {
    const host = req.get('host');
    const email = req.sessionModel.get('user-email') || req.form.values['user-email'];

    if (this.skipEmailVerification(email)) {
      return super.saveValues(req, res, next);
    }

    const token = tokenGenerator.save(req, email);
    try {
      const response = await axios.get(baseUrl + '/uan/' + req.sessionModel.get('uan'));
      const claimantRecords = response.data;
      const recordID = claimantRecords.map(f => { return f.id; });
      const recordEmail = claimantRecords.map(f => { return f.email; });
      if (recordEmail == false) {
        try {
          await axios({
            url: baseUrl + `/${recordID}`,
            method: 'PATCH',
            data: { email }
          });
        } catch (e) {
          return next(e);
        }
      } else if (recordEmail != null && req.form.values['user-email'] !== recordEmail.toString()) {
        return next({
          'user-email': new this.ValidationError(
            'user-email',
            {
              type: 'noRecordMatch'
            }
          )
        });
      }
    } catch (e) {
      return next(e);
    }

    try {
      await notifyClient.sendEmail(templateId, email, {
        personalisation: getPersonalisation(host, token, req, req)
      });
    } catch (e) {
      return next(e);
    }

    return super.saveValues(req, res, next);
  }
};
