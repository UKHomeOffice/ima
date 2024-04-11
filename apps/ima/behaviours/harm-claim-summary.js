// const _ = require('lodash');

// // Additional person fields are optional, so this behaviour sets each additional
// // person a number so as to be identifiable.
// module.exports = superclass => class extends superclass { 
//   locals(req, res) {
//     const locals = super.locals(req, res);
//     // render country number on country-details page
//     _.forEach(locals.items, i => {
//       const countryNumber = _.indexOf(locals.items, i);

//       _.forEach(i.fields, field => {
//         if (field.field === 'countryAddNumber') {
//           field.value = countryNumber;
//           field.parsed = countryNumber;
//         }

//         if (field.field === 'why-not-get-protection') {
//           field.field += '.summary-heading1';
//         }
//       });
//     });
//     console.log("locals = " + JSON.stringify(locals))
//     return locals;
//   }
// };
const _ = require('lodash');

module.exports = superclass => class extends superclass {
  // configure(req, res, next){
  //   if(req.form.options.route === '/harm-claim-summary') {
  //     console.log("Hello1 = " + JSON.stringify(req.query));
  //     console.log("Hello = " + JSON.stringify(req.sessionModel.get('sih-countries'))); 
  //     console.log("Hello = " + req.sessionModel.get('sih-countries').aggregatedValues.length)
  //     // if(req.sessionModel.get('sih-countries').aggregatedValues.length === 0) {
  //     //   console.log("Hello = " + req.sessionModel.get('sih-countries').aggregatedValues.length)
  //     //   return res.redirect(`${req.baseUrl}/harm-claim`); 
  //     // }
  //   }
  //   next()
  // }
  locals(req, res) {
    const locals = super.locals(req, res);
    _.forEach(locals.items, i => {
      const countryNumber = _.indexOf(locals.items, i);
      const countryName = req.sessionModel.get('sih-countries').aggregatedValues;
      _.forEach(i.fields, field => {
        if (field.field === 'reason-in-sih') {
          if (!field.value) {
            field.showInSummary = false;
          }
        }
        if (field.field === 'why-not-get-protection') {
          if (!field.value) {
            field.showInSummary = false;
          }
          switch (countryNumber) {
            case 0:
              locals['country-name-1'] = countryName[0].itemTitle;
              field.field += '.summary-heading1';
              break;
            case 1:
              locals['country-name-2'] = countryName[1].itemTitle;
              field.field += '.summary-heading2';
              break;
            case 2:
              locals['country-name-3'] = countryName[2].itemTitle;
              field.field += '.summary-heading3';
              break;
            case 3:
              locals['country-name-4'] = countryName[3].itemTitle;
              field.field += '.summary-heading4';
              break;
            case 4:
              locals['country-name-5'] = countryName[4].itemTitle;
              field.field += '.summary-heading5';
              break;
            default:
          }
        }
      });
    });
    if(req.sessionModel.get('sih-countries').aggregatedValues.length === 0) {
     locals.addStep='harm-claim';
    }

    console.log("locals = " +JSON.stringify(locals))
    return locals;
  }
};
