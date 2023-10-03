/* eslint max-len: 0 */

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
