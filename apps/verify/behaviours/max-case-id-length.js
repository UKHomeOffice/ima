'use strict';

const maxLength = 50;

module.exports = superclass => class extends superclass {
  validateField(key, req) {
    /* Checks the max length of the field is not above 8 characters */
    const uanValue = req.form.values['uan'];

    if (uanValue.length > maxLength && key === 'uan') {
      return new this.ValidationError(key, {
        key,
        type: 'maxUANLength',
        redirect: undefined
      });
    }
    return super.validateField(key, req);
  }
};
