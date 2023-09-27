/* eslint-disable consistent-return, max-len, default-case */
// const _ = require('lodash');
// const moment = require('moment');
// const Reports = require('./reports');
// const config = require('../../config.js');
// const postgresDateFormat = config.saveService.postgresDateFormat;
// const excelDateTime = 'YYYY-MM-DD HH:mm:ss';

// const TIME_RANGES = [
//   'Up to 24 hours old',
//   '1-2 days old',
//   '2-3 days old',
//   '3-4 days old',
//   '4-5 days old',
//   '5-6 days old',
//   '6-7 days old',
//   '1-2 weeks old',
//   '2-4 weeks old',
//   '1 month+ old'
// ];

// const ageBracket = date => {
//   switch (true) {
//     case date <= 24:
//       return TIME_RANGES[0];
//     case date > 24 && date <= 48:
//       return TIME_RANGES[1];
//     case date > 48 && date <= 72:
//       return TIME_RANGES[2];
//     case date > 72 && date <= 96:
//       return TIME_RANGES[3];
//     case date > 96 && date <= 120:
//       return TIME_RANGES[4];
//     case date > 120 && date <= 144:
//       return TIME_RANGES[5];
//     case date > 144 && date <= 168:
//       return TIME_RANGES[6];
//     case date > 168 && date <= 336:
//       return TIME_RANGES[7];
//     case date > 336 && date <= 672:
//       return TIME_RANGES[8];
//     case date > 672:
//       return TIME_RANGES[9];
//   }
// };

// module.exports = class UnsubmittedReports {
//   static async createReport(type, logger) {
//     try {
//       const SERVICE_GO_LIVE_DATE = '2024-01-16T00:00:00+01:00';
//       const startOfDataRetentionWindow = moment().subtract(186, 'days').format();
//       const has6MonthsPassedSinceGoLive = startOfDataRetentionWindow > SERVICE_GO_LIVE_DATE;
//       const dataRetentionWindowStart = has6MonthsPassedSinceGoLive ? startOfDataRetentionWindow : SERVICE_GO_LIVE_DATE;

//       const report = new Reports({
//         type,
//         tableName: 'reports',
//         from: moment(dataRetentionWindowStart).format(postgresDateFormat)
//       });

//       const response = await report.getRecordsWithProps({
//         timestamp: 'updated_at',
//         selectableProps: 'case_id,submitted_at' TODO - UPDATE WITH CORRECT PROPS ONCE PROVIDED
//       });

//       const allCases = _.sortBy(response.data, 'updated_at').reverse();
//       const unsubmittedCases = allCases.filter(obj => !obj.submitted_at);
//       const submittedUans = allCases.filter(obj => obj.submitted_at).map(obj => obj.case_id); TODO - UPDATE WITH CORRECT PROPS ONCE PROVIDED

//       let uniqCases = _.uniqBy(unsubmittedCases, 'case_id');
//       uniqCases = uniqCases.filter(obj => !submittedUans.includes(obj.case_id)); TODO - UPDATE WITH CORRECT PROPS ONCE PROVIDED

//       const casesInCreatedAtOrder = _.sortBy(uniqCases, 'created_at');

//       let rowsData = casesInCreatedAtOrder.map(obj => {
//         const age = ageBracket(moment.duration(moment().diff(moment(obj.created_at))).asHours());
//         return [
//           obj.case_id,
//           age,
//           moment(obj.created_at).format(excelDateTime),
//           moment(obj.updated_at).format(excelDateTime),
//           ''
//         ];
//       });

//       const ageCounts = rowsData.map(row => row[1]);
//       const timeEntries = Object.fromEntries(TIME_RANGES.map(v => [v, 0]));
//       const countObj = ageCounts.reduce((a, c) => {
//         a[c] += 1;
//         return a;
//       }, timeEntries);

//       rowsData = rowsData.map((row, index) => {
//         let values = row;
//         if (index === 0) {
//           const rangeCounts = TIME_RANGES.slice().reverse().map(v => countObj[v]);
//           values = values.concat(rangeCounts);
//         } else {
//           values = values.concat(TIME_RANGES.map(() => ''));
//         }
//         return values;
//       });

//       const headings = [
//         'Case IDs', TODO - UPDATE WITH CORRECT HEADING ONCE PROVIDED
//         'Age Bracket',
//         'Created At',
//         'Updated At',
//         ''
//       ].concat(TIME_RANGES.slice().reverse());

//       await report.transformToCsv(type, headings, rowsData);
//       return await report.sendReport(type);
//     } catch(e) {
//       return logger ? logger.log('error', e) : console.error(e);
//     }
//   }
// };
