const config = require('../../../config');
const NotifyClient = require('notifications-node-client').NotifyClient;
const notifyApiKey = config.govukNotify.notifyApiKey;
const notifyClient = new NotifyClient(notifyApiKey);
const templateId = config.govukNotify.userAuthTemplateId;
const tokenGenerator = require('../../../db/save-token');
const _ = require('lodash');

const getPersonalisation = (host, token, req) => {
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return {
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

  async saveValues(req, res, next) {
    const host = req.get('host');
    const email = req.sessionModel.get('user-email') || req.form.values['user-email'];

    if (this.skipEmailVerification(email)) {
      return super.saveValues(req, res, next);
    }

    const token = tokenGenerator.save(req, email);

    try {
      await notifyClient.sendEmail(templateId, email, {
        personalisation: getPersonalisation(host, token, req, req)
      });
    } catch (e) {
      const err = _.get(e, 'response.data.errors[0].message', e);
      return next(e);
    }

    return super.saveValues(req, res, next);
  }
};
