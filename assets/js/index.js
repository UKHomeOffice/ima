'use strict';

require('hof/frontend/themes/gov-uk/client-js');
const govuk = require('govuk-frontend');
const $ = require('jquery');
const accessibleAutocomplete = require('accessible-autocomplete');

$('.typeahead').each(function applyTypeahead() {
  accessibleAutocomplete.enhanceSelectElement({
    defaultValue: '',
    selectElement: this
  });
});

$(document).ready(function () {
  if ($('#loader-container')) {
    $('.govuk-button').on('click', function () {
      $('#loader-container').addClass('spinner-loader');
      $('#onboard-cases').addClass('visuallyhidden');
    });
  }
});

// Show/hide input if 'Other' is selected for the UK immigration status including page refreshes
$( document ).ready(function () {
  if ($('#uk-immigration-status').val() === 'Other') {
    $('#immigration-status-detail-panel').show();
  } else {
    $('#immigration-status-detail-panel').hide();
  }
});

$('#uk-immigration-status').change(function () {
  if ($(this).val() === 'Other') {
    $('#immigration-status-detail-panel').show();
  } else {
    $('#immigration-status-detail-panel').hide();
  }
});

govuk.initAll();
