const _ = require("lodash");

// Additional person fields are optional, so this behaviour sets each additional person a number so as to be identifiable.

module.exports = superclass => class extends superclass {

    locals(req, res) {
        const locals = super.locals(req, res);
        
         
    // render country number on country-details page
        _.forEach(locals.items, (i) => {
         
          const countryNumber = _.indexOf(locals.items, i);
       
        req.sessionModel.get('sih-countries').aggregatedValues
          var countryName =  req.sessionModel.get('harm-claim-countries');
          req.form.values['country-name'] = countryName[countryNumber];

          i.itemTitle = countryName[countryNumber]
          _.forEach(i.fields, (field) => {
            if (field.field === 'countryAddNumber') {
              field.value = countryNumber
              field.parsed = countryNumber
            }
            if (field.field === 'why-not-get-protection') {
            locals['country-name']= countryName[countryNumber];
              field.field += '.summary-heading';
            }
          })
        })
        return locals;
      }
    };
    

