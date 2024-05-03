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

    // use either the email entered on the validation page or the one entered within the form
    let userFormEmail = '';
    if(req.sessionModel.get('current-email') === 'yes') {
      userFormEmail = userEmail;
    } else if(req.sessionModel.get('current-email') === 'no') {
      userFormEmail = req.sessionModel.get('email-address-details');
    }

    let advisorEmail = '';
    if(req.sessionModel.get('is-legal-representative-email') === 'yes') {
      advisorEmail = userEmail;
    } else if(req.sessionModel.get('is-legal-representative-email') === 'no') {
      advisorEmail = req.sessionModel.get('legal-representative-email');
    }

    const claimsEmail = process.env.CLAIMS_EMAIL;

    const allUniqueEmails = _.uniq([userEmail, userFormEmail, advisorEmail, claimsEmail].filter(e => e));

    req.sessionModel.set('all-unique-emails', allUniqueEmails);

    return super.successHandler(req, res, next);
  }
};
