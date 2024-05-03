
const moment = require('moment');
const Reports = require('./reports');
const config = require('../../config.js');
const postgresDateFormat = config.saveService.postgresDateFormat;

module.exports = class DailySubmittedReports {
  static async createReport(type, logger) {
    try {
      const time10am = moment().set({h: 10, m: 0, s: 0});

      const report = new Reports({
        type,
        tableName: 'saved_applications',
        from: time10am.clone().subtract(1, 'day').format(postgresDateFormat),
        to: time10am.clone().subtract(1, 'second').format(postgresDateFormat)
      });

      const response = await report.getRecordsWithProps({ timestamp: 'submitted_at' });

      await report.transformToAllQuestionsCsv(type, response.data);
      return await report.sendReport(type);
    } catch(e) {
      return logger ? logger.log('error', e) : console.error(e);
    }
  }
};
