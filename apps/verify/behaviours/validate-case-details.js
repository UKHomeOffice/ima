
const axios = require('axios');
const config = require('../../../config');
const baseUrl = `${config.saveService.host}:${config.saveService.port}/saved_applications`;

module.exports = superclass => class extends superclass {
  async saveValues(req, res, next) {
    try {
      const response = await axios.get(baseUrl + '/uan/' + req.form.values.uan);
      const claimantRecords = response.data;
      const record = claimantRecords.map(f => { return f.date_of_birth; });
      if (claimantRecords.length && !record.includes(req.form.values['date-of-birth'])) {
        return res.redirect('/not-found');
      }
      if (!claimantRecords.length) {
        return res.redirect('/not-found');
      }
    } catch (e) {
      return next(e);
    }
    return super.saveValues(req, res, next);
  }
};
