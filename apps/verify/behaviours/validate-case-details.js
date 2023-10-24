const config = require('../../../config');

module.exports = superclass => class extends superclass {
  saveValues(req, res, next) {
    if (!this.isValidCase(req)) {
      return res.redirect('/not-found');
    }
    return super.saveValues(req, res, next);
  }

  isValidCase(req) {
    const casesJson = require(`../../../data/${config.casesIds.S3Id}.json`);
    const uan = req.form.values.uan;
    const dob = req.form.values['date-of-birth'];

    const imaResult = casesJson.find(
      obj => obj.uan === uan && obj['date-of-birth'] === dob);
    req.sessionModel.set('service', 'ima');
    return imaResult;
  }
};
