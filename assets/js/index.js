'use strict';

require('hof/frontend/themes/gov-uk/client-js');
const govuk = require('govuk-frontend');
const $ = require('jquery');
const accessibleAutocomplete = require('accessible-autocomplete');
const harmCountriesRepeater = require('./harm-countries-repeater');
const selectedCountry = require('./selected-country');

$('.typeahead').each(function applyTypeahead() {
  accessibleAutocomplete.enhanceSelectElement({
    defaultValue: '',
    selectElement: this
  });
});

govuk.initAll();
harmCountriesRepeater.init();
selectedCountry.init();
