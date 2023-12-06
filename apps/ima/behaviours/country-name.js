const _ = require("lodash");

// Additional person fields are optional, so this behaviour sets each additional person a number so as to be identifiable.

module.exports = superclass => class extends superclass {

    // saveValues(req,res,next){
    //     var currentCountries = req.sessionModel.get('harm-claim-countries');

    //     console.log(currentCountries);
    //     req.sessionModel.set('country-placeholder', currentCountries[0]);
        
    //     currentCountries.slice(1);
    //    // req.sessionModel.set('current-state', );
    //    return super.saveValues(req,res,next)
    // }


    locals(req, res) {
        const locals = super.locals(req, res);
        
    // render country number on country-details page
        _.forEach(locals.items, (i) => {
          const countryNumber = _.indexOf(locals.items, i);
          var countryName =  req.sessionModel.get('harm-claim-countries');
        
          i.itemTitle = countryName[countryNumber]
          _.forEach(i.fields, (field) => {
            if (field.field === 'countryAddNumber') {
              field.value = countryNumber
              field.parsed = countryNumber
            }
          })
        })
    
        // render only country number field for Additional People section on check answers page
        if (locals.route === 'confirm') {
          _.forEach(locals.rows, (fields) => {
            locals.rows = locals.rows.map(row => {
              if (row.section === 'Additional People') {
                row.fields = row.fields.filter(r => r.field === 'countryAddNumber');
                _.forEach(fields, (sectionFields) => {
                  _.forEach(sectionFields, (field) => {
                    if (field.field === 'countryAddNumber') {
                      field.value = 'country ' + (field.index + 1)
                      field.parsed = 'country ' + (field.index + 1)
                    }
                  })
                })
                return row;
              }
            return row 
            });
          })
        }
        return locals;
      }
    };
    

