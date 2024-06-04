/* eslint-disable no-console */

const config = require('../config');

class NotifyMock {
  sendEmail() {
    return Promise.resolve();
  }

  sendSms() {
    return Promise.resolve();
  }

  prepareUpload() {}
}

const secondsBetween = (startDate, endDate) => {
  const dif = endDate - startDate;
  const secondsFromStartToEnd = dif / 1000;
  return Math.abs(secondsFromStartToEnd);
};

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

const getPersonalisation = (host, token) => {
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return {
    // pass in `&` at the end in case there is another
    // query e.g. ?hof-cookie-check
    link: `${protocol}://${host + config.login.appPath}?token=${token}&`,
    host: `${protocol}://${host}`
  };
};

module.exports = {
  capitalize,
  secondsBetween,
  getPersonalisation,
  NotifyClient: config.govukNotify.notifyApiKey === 'USE_MOCK' ?
    NotifyMock : require('notifications-node-client').NotifyClient
};
