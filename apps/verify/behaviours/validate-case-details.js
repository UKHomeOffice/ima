
const axios = require('axios');
const url = require('url');
const _ = require('lodash');
const config = require('../../../config');
const moment = require('moment');
const baseUrl = `${config.saveService.host}:${config.saveService.port}/saved_applications`;

module.exports = superclass => class extends superclass {
  // saveValues(req, res, next) {
  //   if (!this.isValidCase(req)) {
  //     return res.redirect('/ineligible');
  //   }
  //   return super.saveValues(req, res, next);
  // }

  async validate(req, res, next) {
    try {
      const uan = req.form.values['uan'];
      const dob = req.form.values['date-of-birth'];
      // let data = { 
      //   uan: uan, 
      //   date_of_birth: dob,
      //   email: encodeEmail('rhodine.orleans-lindsay@digital.homeoffice.gov.uk')
      // }
      // const params = new url.URLSearchParams(data);


      // const response = await axios.get(baseUrl, { params: { 
      //   uan: uan, 
      //   date_of_birth: dob
      // }});
    
      const response = await axios.get(baseUrl + '/uan/'  +  uan);
      const responseDob = await axios.get(baseUrl + '/date_of_birth/'  + dob);
      const claimantRecordsByUan = response.data
      const claimantRecordsByDob = responseDob.data
        if (!claimantRecordsByUan.length && claimantRecordsByDob.length ) {
        return next({
          uan: new this.ValidationError(
            'uan',
            {
              type: 'noUanRecordMatch',
              redirect: undefined
            }
          )
        });
      }
      if (claimantRecordsByUan.length && !claimantRecordsByDob.length ) {
        return next({
          'date-of-birth': new this.ValidationError(
            'date-of-birth',
            {
              type: 'noDateRecordMatch',
              redirect: undefined
            }
          )
        });
      }
      if (!claimantRecordsByUan.length && !claimantRecordsByDob.length) {
        return next({
          'date-of-birth': new this.ValidationError(
            'date-of-birth',
            {
              type: 'noDateRecordMatch',
              redirect: undefined
            }
          ),
          uan: new this.ValidationError(
            'uan',
            {
              type: 'noUanRecordMatch',
              redirect: undefined
            }
          )
        });
      }
    } catch (e) {
      return next(e);
    }
    return super.validate(req, res, next);
  }

 
 
};
