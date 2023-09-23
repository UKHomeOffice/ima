
module.exports = superclass => class extends superclass {
  locals(req, res) {
    const locals = Object.assign({}, super.locals(req, res), {
      userEmail: req.sessionModel.get('user-email')
    });

    req.sessionModel.reset();

    return locals;
  }
};
