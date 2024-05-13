const config = require('../../../config');
const _ = require('lodash');
const axios = require('axios');
const logger = require('hof/lib/logger')({ env: config.env });

const baseUrl = `${config.saveService.host}:${config.saveService.port}/cepr_lookup/cepr/`;

module.exports = superclass => class extends superclass {
  async saveValues(req, res, next) {
    const validCase = await this.isValidCase(req);
    if (!validCase) {
      return res.redirect('/details-not-found');
    }
    return super.saveValues(req, res, next);
  }

  async isValidCase(req) {
    const cepr = req.form.values.cepr;
    const dob = req.form.values['date-of-birth'];

    try {
      const response = await axios.get(baseUrl + cepr);
      const cases = response.data;

      const imaResult = cases.find(obj => {
        return obj.cepr === cepr && obj.dob.split('/').reverse().join('-') === dob;
      });

      if(_.isEmpty(imaResult) === false) {
        req.sessionModel.set('duty-to-remove-alert', imaResult.dtr);
      }
      req.sessionModel.set('service', 'ima');

      return imaResult;
    } catch (error) {
      logger.log('error', `Could not get valid cases: ${error}`);
      return null;
    }
  }
};
