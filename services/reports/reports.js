'use strict';

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const config = require('../../config');
const _ = require('lodash');
const moment = require('moment');
const utilities = require('../../lib/utilities');
const postgresDateFormat = config.saveService.postgresDateFormat;
const NotifyClient = utilities.NotifyClient;
const notifyKey = config.govukNotify.notifyApiKey;
const csvReportTemplateId = config.govukNotify.csvReportTemplateId;
const csvReportEmail = config.govukNotify.csvReportEmail;
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json } = format;

const logger = createLogger({
  format: combine(timestamp(), json()),
  transports: [new transports.Console({level: 'info', handleExceptions: true})]
});

const baseUrl = `${config.saveService.host}:${config.saveService.port}`;

const notifyClient = new NotifyClient(notifyKey);

module.exports = class Reports {
  constructor(opts) {
    if (!opts.tableName || !opts.from || !opts.type) {
      throw new Error('Please include a "tableName", "type" and "from" property');
    }
    this.type = opts.type;
    this.tableName = opts.tableName;
    this.tableUrl = `${baseUrl}/${opts.tableName}`;
    this.from = opts.from;
    this.to = opts.to || moment().format(postgresDateFormat);
  }

  auth() {
    if (!config.keycloak.token) {
      // eslint-disable-next-line no-console
      console.error('keycloak token url is not defined');
      return Promise.resolve({
        bearer: 'abc123'
      });
    }
    const tokenReq = {
      url: config.keycloak.token,
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        username: config.keycloak.username,
        password: config.keycloak.password,
        grant_type: 'password',
        client_id: config.keycloak.clientId,
        client_secret: config.keycloak.secret
      }
    };

    return axios(tokenReq).then(response => {
      return { bearer: response.data.access_token };
    });
  }

  async getRecordsWithProps(opts) {
    const props = opts || {};
    let url = `${this.tableUrl}/history`;

    props.from = this.from;
    props.to = this.to;

    url = this.#addQueries(url, props);

    return await axios.get(url);
  }

  transformToCsv(name, headings, rows) {
    return new Promise(async (resolve, reject) => {
      const filePath = path.join(__dirname, `/../../data/${name}.csv`);
      await this.#deleteFile(filePath, reject);

      const writeStream = fs.createWriteStream(filePath, { flag: 'a+' });
      // there are commas in questions so using ; as an alternative CSV file delimiter
      await writeStream.write(headings.join(','));

      rows.forEach(async record => {
        await writeStream.write('\r\n' + record.join(','));
      });

      writeStream.on('error', reject);
      writeStream.end(resolve);
    });
  }

  transformToAllQuestionsCsv(name, data) {
    return new Promise(async (resolve, reject) => {
      const fieldsAndTranslations = this.#collectFieldsAndTranslations();
      const questionsTranslations = fieldsAndTranslations.map(obj => {
        return `${obj.translation}: {${obj.field}}`.replaceAll(',', '-');
      });
      const questionsFields = fieldsAndTranslations.map(obj => obj.field);
      const filePath = path.join(__dirname, `/../../data/${name}.csv`);

      await this.#deleteFile(filePath, reject);

      const writeStream = fs.createWriteStream(filePath, { flag: 'a+' });
      // there are commas in questions so using ; as an alternative CSV file delimiter
      await writeStream.write(questionsTranslations.join(','));

      data.forEach(async record => {
        let session;

        try {
          session = JSON.parse(record.session);
        } catch(e) {
          session = record.session;
        }
        let agg = [];

        Object.keys(session).forEach(function (key) {
          if (_.get(session[key], 'aggregatedValues')) {
            agg = agg.concat(_.flatten(_.map(session[key].aggregatedValues, obj => obj.fields )));
          }
        });

        const fieldStr = questionsFields.map(field => {
          if (!session[field] && _.find(agg, obj => obj.field === field)) {
            const foundFields = _.filter(agg, obj => obj.field === field);
            return _.map(foundFields, obj => obj.value || 'N/A').join(' | ').replaceAll(',', '-');
          }
          const sessionField = session[field] || '';
          return (Array.isArray(sessionField) ? sessionField.join(' | ') : sessionField).replaceAll(',', '-');
        }).join(',');

        await writeStream.write('\r\n' + fieldStr);
      });

      writeStream.on('error', reject);
      writeStream.end(resolve);
    });
  }

  sendReport(fileName) {
    const filePath = path.join(__dirname, `/../../data/${fileName}.csv`);

    return new Promise((resolve, reject) => {
      return fs.readFile(filePath, (err, csvFile) => {
        if (err) {
          return reject(err);
        }
        const startDate = moment(this.from);
        const endDate = moment(this.to);

        const form = new FormData();
        form.append('document', new Blob([csvFile], { type: 'text/csv' }), `${fileName}.csv`);

        return this.auth().then(auth => {
          return axios.post(config.upload.hostname, form, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Basic ${auth.bearer}`
            }
          });
        }).then(response => {
          const fileUUID = response.data.url.split('/file/')[1].split('?')[0];
          logger.log({
            level: 'info',
            message: `IMA CSV generated for ${this.type}, UUID is: ${fileUUID}`
          });
          return notifyClient.sendEmail(csvReportTemplateId, csvReportEmail, {
            personalisation: {
              report_type: this.type,
              start_day: startDate.format('D MMM'),
              end_day: endDate.format('D MMM'),
              start_date: startDate.format(`${config.PRETTY_DATE_FORMAT} HH:mm:ss`),
              end_date: endDate.format(`${config.PRETTY_DATE_FORMAT} HH:mm:ss`),
              link_to_file: response.data.url.replace('/file/', '/file/generate-link/').split('?')[0]
            }
          });
        }).then(async () => {
          // eslint-disable-next-line no-console
          logger.log({
            level: 'info',
            message: `Email sent to IMA CSV users successfully for ${this.type}`
          });
          await this.#deleteFile(filePath, reject);
          return resolve();
        }).catch(error => {
          // eslint-disable-next-line no-console
          logger.log({
            level: 'info',
            message: `Error generated for IMA for ${this.type} CSV: ${error}`
          });
        });
      });
    });
  }

  #addQueries(domain, opts) {
    let url = `${domain}?`;

    Object.keys(opts).forEach(function (key) {
      url += `${key}=${opts[key]}&`;
    });

    return url;
  }

  #collectFieldsAndTranslations() {
    const journeys = ['verify', 'ima'];

    return _.flatten(_.map(journeys, journey => {
      const fields = require(`../../apps/${journey}/fields`);
      const fieldsTranslations = require(`../../apps/${journey}/translations/src/en/fields`);
      const pagesTranslations = require(`../../apps/${journey}/translations/src/en/pages`);
      const fieldsAndTranslations = [];

      Object.keys(fields).forEach(key => {
        fieldsAndTranslations.push({
          field: key,
          translation: (_.get(pagesTranslations, `[${key}].header`) ||
            _.get(fieldsTranslations, `[${key}].label`) ||
            _.get(fieldsTranslations, `[${key}].legend`, key)).trim() || key
        });
      });
      return fieldsAndTranslations;
    }));
  }

  async #deleteFile(file, callback) {
    await fs.unlink(file, err => {
      if (err && err.code !== 'ENOENT') {
        callback(err);
      }
    });
  }
};
