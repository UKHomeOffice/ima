'use strict';

const _ = require('lodash');
const CreateAndSendPDF = require('./create-and-send-pdf');

module.exports = superclass => class extends superclass {
  successHandler(req, res, next) {
    const uploadPdfShared = new CreateAndSendPDF({
      sendReceipt: true,
      sortSections: true
    });
    // don't await async process, allow user to move on
    uploadPdfShared.send(req, res, super.locals(req, res));

    const userEmail = req.sessionModel.get('user-email');
    const userFormEmail = req.sessionModel.get('email-address-details');
    const advisorEmail = req.sessionModel.get('legal-representative-email');
    const allUniqueEmails = _.uniq([userEmail, userFormEmail, advisorEmail].filter(e => e));
    req.sessionModel.set('all-unique-emails', allUniqueEmails);

    return super.successHandler(req, res, next);
  }
};
