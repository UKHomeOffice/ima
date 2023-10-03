/* eslint max-len: 0 */
const moment = require('moment');
const PRETTY_DATE_FORMAT = 'DD/MM/YYYY';

module.exports = {
  'evidence-documents': [
    {
      step: '/evidence-upload',
      field: 'images',
      parse: (list, req) => {
        if (!req.sessionModel.get('images')) {
          return 'None uploaded';
        }
        return list && list.map(i => i.name).join('\n________________________\n');
      }
    }
  ]
};
