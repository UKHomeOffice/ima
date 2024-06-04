/* eslint-disable consistent-return, default-case */
const DailySubmittedReports = require('./daily_submitted_reports');

module.exports = class ReportsFactory {
  static async createReport(type, logger) {
    switch(type) {
      case '24-hour-report':
        return await DailySubmittedReports.createReport(type, logger);
    }
  }
};
