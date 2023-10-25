
const XLSX = require('xlsx');
const moment = require('moment');
const config = require('../config');
// Yep. You'd think it would be days counted from 31st, but due to a known Lotus bug being carried over
// to Excel back in the 1990s. All Excel raw data date integers are counted from this day. Who knew.
// This comment is put here for anyone's reference, other than unit tests, so that noone thinks it's a bug.
const excelStartDate = moment('1899-12-30', 'YYYY-MM-DD');

const UAN_VALID_LENGTH = config.casesIds.uanValidLength;

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

        if (cleanedUpKey.startsWith('uan')) {
          // ids come in as integers from excel raw data
          // as a precaution, padded zeros inserted so uans are correct length
          const uan = obj[key].toString();
          newObj.uan = uan.length < UAN_VALID_LENGTH ?
            String('0'.repeat(UAN_VALID_LENGTH) + uan).slice(-UAN_VALID_LENGTH) : uan;
        } else if (cleanedUpKey.startsWith('dateofbirth')) {
          // dates come in as integers from excel raw data representing days since '1899-12-30'
          // we convert them to a consistent date string format to validate against user input
          newObj['date-of-birth'] = excelStartDate.clone().add(obj[key], 'days').format('YYYY-MM-DD');
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
