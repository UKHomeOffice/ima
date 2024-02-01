'use strict';
module.exports = superclass => class extends superclass {
  saveValues(req, res, next) {
    const route = `${req.baseUrl}${req.form.options.route}`;
    if (route.includes('/edit')) {
      req.sessionModel.set('is-update', true);
    }
    return super.saveValues(req, res, next);
  }
};
