const config = require('../../../config');

module.exports = superclass => class extends superclass {
  saveValues(req, res, next) {
    if (!this.isValidCase(req)) {
      return res.redirect('/details-not-found');
    }
    return super.saveValues(req, res, next);
  }

  isValidCase(req) {
    const casesJson = require(`../../../data/${config.casesIds.S3Id}.json`);
    const cepr = req.form.values.cepr;
    const dob = req.form.values['date-of-birth'];

    const imaResult = casesJson.find(
      obj => obj.cepr === cepr && obj['date-of-birth'] === dob);
    req.sessionModel.set('service', 'ima');
    return imaResult;
  }
};
