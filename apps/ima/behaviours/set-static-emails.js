const config = require('../../../config');

module.exports = superclass => class extends superclass {
  locals(req, res) {
    const locals = super.locals(req, res);
    locals.queriesEmail = config.queriesEmail;
    return locals;
  }
};
