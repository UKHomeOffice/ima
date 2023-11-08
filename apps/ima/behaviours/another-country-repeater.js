'use strict';

module.exports = superclass => class extends superclass {
  saveValues(req, res, next) {
    req.form.values.anotherNames = [
      req.form.values['country-1'],
      req.form.values['country-2'],
      req.form.values['country-3'],
      req.form.values['country-4']
    ].filter(Boolean);
    return super.saveValues(req, res, next);
  }

  getValues(req, res, next) {
    super.getValues(req, res, (err, values) => {
      const anotherNames = req.sessionModel.get('anotherNames') || [];
      values['country-1'] = anotherNames[0] || '';
      values['country-2'] = anotherNames[1] || '';
      values['country-3'] = anotherNames[2] || '';
      values['country-4'] = anotherNames[3] || '';
      next(err, values);
    });
  }
};
