
const XLSX = require('xlsx');
const moment = require('moment');
// Yep. You'd think it would be days counted from 31st, but due to a known Lotus bug being carried over
// to Excel back in the 1990s. All Excel raw data date integers are counted from this day. Who knew.
// This comment is put here for anyone's reference, other than unit tests, so that noone thinks it's a bug.
const excelStartDate = moment('1899-12-30', 'YYYY-MM-DD');

const cleanupString = str => {
  return str.toLowerCase().replace(/[^a-zA-Z]+/g, '');
};

const mapJsonValues = json => {
  return json.map(obj => {
    const newObj = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // keys cleaned up if future excel sheets change case, use -/_ instead of spaces in key names etc
        const cleanedUpKey = cleanupString(key);

        if (cleanedUpKey.startsWith('cepr')) {
          // ids come in as integers from excel raw data
          // as a precaution, padded zeros inserted so uans are correct length
          const cepr = obj[key].toString();
          newObj.cepr = cepr;
        } else if (cleanedUpKey.startsWith('dob')) {
          // dates come in as integers from excel raw data representing days since '1899-12-30'
          // we convert them to a consistent date string format to validate against user input
          newObj['date-of-birth'] = excelStartDate.clone().add(obj[key], 'days').format('YYYY-MM-DD');
        } else if (cleanedUpKey.startsWith('dutytoremovealert')) {
          const dutyToRemoveAlert = obj[key].toString();
          newObj['duty-to-remove-alert'] = dutyToRemoveAlert;
        }
      }
    }

    return newObj;
  });
};

const XLSXProcessor = sheet => {
  const workbook = XLSX.readFile(`${process.cwd()}/data/${sheet}.xlsx`);
  const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  return mapJsonValues(json);
};

module.exports = XLSXProcessor;
