
const axios = require('axios');
const config = require('../../../config');
const moment = require('moment');
const baseUrl = `${config.saveService.host}:${config.saveService.port}/saved_applications`;

module.exports = superclass => class extends superclass {
  async saveValues(req, res, next) {
    try {
      const response = await axios.get(baseUrl + '/uan/' + req.form.values['uan']);
      const claimantRecordsByUan = response.data
      const record = claimantRecordsByUan.map(f => { return f.date_of_birth })
      if (claimantRecordsByUan.length && !record.includes(moment(req.form.values['date-of-birth']).format('YYYY/MM/DD'))) {
        return res.redirect('/not-found');
      }
      if (!claimantRecordsByUan.length) {
        return res.redirect('/not-found');
      }
    } catch (e) {
      return next(e);
    }
    return super.saveValues(req, res, next);
  }
};
