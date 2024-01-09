'use strict';

module.exports = {
  'who-are-you': {
    isPageHeading: true,
    mixin: 'radio-group',
    options: ['person-named', 'has-legal-representative', 'someone-else'],
    validate: 'required'
  },
  'how-removal-condition-1-applies': {
    mixin: 'checkbox-group',
    validate: 'required',
    legend: {
      className: 'visuallyhidden'
    },
    options: [{
      value: 'entered-without-permission'
    }, {
      value: 'by-deception'
    }, {
      value: 'deportation-order-applies'
    }, {
      value: 'travel-ban'
    }, {
      value: 'arrived-without-visa'
    }, {
      value: 'arrived-without-eta'
    }]
  },
  'entered-without-permission': {
    isPageHeading: false,
    mixin: 'radio-group',
    legend: {
      className: 'visuallyhidden'
    },
    options: [{
      value: 'yes'
    }, {
      value: 'no',
      toggle: 'entered-without-permission-detail-fieldset',
      child: 'partials/entered-without-permission-detail'
    }],
    validate: 'required'
  },
  'entered-without-permission-detail': {
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: 15000 }],
    dependent: {
      field: 'entered-without-permission',
      value: 'no'
    },
    attributes: [{
      attribute: 'rows',
      value: 5
    }]
  },
  'entered-with-travel-ban': {
    isPageHeading: false,
    mixin: 'radio-group',
    legend: {
      className: 'visuallyhidden'
    },
    options: [{
      value: 'yes'
    }, {
      value: 'no',
      toggle: 'entered-with-travel-ban-detail-fieldset',
      child: 'partials/entered-with-travel-ban-detail'
    }],
    validate: 'required'
  },
  'entered-with-travel-ban-detail': {
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: 15000 }],
    dependent: {
      field: 'entered-with-travel-ban',
      value: 'no'
    },
    attributes: [{
      attribute: 'rows',
      value: 5
    }]
  },
  'entered-by-deception': {
    isPageHeading: false,
    mixin: 'radio-group',
    legend: {
      className: 'visuallyhidden'
    },
    options: [{
      value: 'yes'
    }, {
      value: 'no',
      toggle: 'entered-by-deception-detail-fieldset',
      child: 'partials/entered-by-deception-detail'
    }],
    validate: 'required'
  },
  'entered-by-deception-detail': {
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: 15000 }],
    dependent: {
      field: 'entered-by-deception',
      value: 'no'
    },
    attributes: [{
      attribute: 'rows',
      value: 5
    }]
  },
  'arrived-without-clearance': {
    isPageHeading: false,
    mixin: 'radio-group',
    legend: {
      className: 'visuallyhidden'
    },
    options: [{
      value: 'yes'
    }, {
      value: 'no',
      toggle: 'arrived-without-clearance-detail-fieldset',
      child: 'partials/arrived-without-clearance-detail'
    }],
    validate: 'required'
  },
  'arrived-without-clearance-detail': {
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: 15000 }],
    dependent: {
      field: 'arrived-without-clearance',
      value: 'no'
    },
    attributes: [{
      attribute: 'rows',
      value: 5
    }]
  },
  'without-eta': {
    isPageHeading: false,
    mixin: 'radio-group',
    legend: {
      className: 'visuallyhidden'
    },
    options: [{
      value: 'yes'
    }, {
      value: 'no',
      toggle: 'without-eta-detail-fieldset',
      child: 'partials/without-eta-detail'
    }],
    validate: 'required'
  },
  'without-eta-detail': {
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: 15000 }],
    dependent: {
      field: 'without-eta',
      value: 'no'
    },
    attributes: [{
      attribute: 'rows',
      value: 5
    }]
  },
  'deportation-order-applied': {
    isPageHeading: false,
    mixin: 'radio-group',
    legend: {
      className: 'visuallyhidden'
    },
    options: [{
      value: 'yes'
    }, {
      value: 'no',
      toggle: 'deportation-order-applied-detail-fieldset',
      child: 'partials/deportation-order-applied-detail'
    }],
    validate: 'required'
  },
  'deportation-order-applied-detail': {
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: 15000 }],
    dependent: {
      field: 'deportation-order-applied',
      value: 'no'
    },
    attributes: [{
      attribute: 'rows',
      value: 5
    }]
  }
};
