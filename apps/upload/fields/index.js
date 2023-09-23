
module.exports = {
  'bulk-upload-claimants': {
    mixin: 'input-file',
    validate: [
      'required'
    ]
  },
  'confirm-data-checked': {
    mixin: 'checkbox',
    validate: [
      'required'
    ]
  },
  'shared-mailbox': {
    validate: ['email']
  }
};
