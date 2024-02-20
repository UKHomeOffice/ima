/* eslint-disable no-cond-assign */

const _ = require('lodash');
const config = require('../../../config');
const parse = require('csv-parse').parse;
const axios = require('axios');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json } = format;

const fileSizeNum = size => size.match(/\d+/g)[0];
const logger = createLogger({
  format: combine(timestamp(), json()),
  transports: [new transports.Console({level: 'info', handleExceptions: true})]
});

const { hostname, maxFileSize } = config.upload;
const {
  allowedMimeTypes,
  mandatoryColumns,
  recordScanLimit,
  filevaultUpload
} = config.uanUpload;
const fileSaveUrl = `${config.saveService.host}:${config.saveService.port}/csv_urls`;
const fieldName = 'bulk-upload-uan';

module.exports = superclass => class extends superclass {
  locals(req, res, next) {
    const maxNum = fileSizeNum(maxFileSize);
    const maxSize = maxFileSize.match(/[a-zA-Z]+/g)[0].toUpperCase();

    return Object.assign({}, super.locals(req, res, next), {
      maxFileSize: `${maxNum}${maxSize}`
    });
  }

  checkFileAttributes(file) {
    const uploadSize = file.size;
    const mimetype = file.mimetype;
    const uploadSizeTooBig = uploadSize > (fileSizeNum(maxFileSize) * 1000000);
    const uploadSizeBeyondServerLimits = uploadSize === null;
    return {
      invalidMimetype: !allowedMimeTypes.includes(mimetype),
      invalidSize: uploadSizeTooBig || uploadSizeBeyondServerLimits
    };
  }

  async process(req, res, next) {
    const fileToProcess = _.get(req.files, `${fieldName}`);

    if (fileToProcess) {
      req.form.values[fieldName] = req.files[fieldName].name;

      const records = [];
      const parser = parse({columns: true, to: recordScanLimit});

      parser.on('readable', function () {
        let record;
        while ((record = parser.read()) !== null) {
          records.push(record);
        }
      });

      parser.on('error', function (error) {
        logger.log({
          level: 'error',
          message: error.message
        });
      });

      await parser.write(req.files[fieldName].data);
      // need to call end() otherwise last record is missed
      parser.end();

      if (records.length) {
        req.sessionModel.set('csv-columns', Object.keys(records[0]));
      } else {
        req.sessionModel.set('csv-columns', []);
      }
    }
    return super.process(req, res, next);
  }

  validate(req, res, next) {
    const fileToValidate = _.get(req.files, `${fieldName}`);
    if (fileToValidate) {
      req.form.values[fieldName] = req.files[fieldName].name;

      const { invalidSize, invalidMimetype } = this.checkFileAttributes(fileToValidate);
      if (invalidSize || invalidMimetype) {
        return next({'bulk-upload-uan': new this.ValidationError('bulk-upload-uan', {
          type: invalidSize ? 'maxFileSize' : 'fileType',
          redirect: undefined
        })});
      }

      if (!fileToValidate.data) {
        return next({'bulk-upload-uan': new this.ValidationError('bulk-upload-uan', {
          type: 'emptyFile',
          redirect: undefined
        })});
      }

      const csvColumns = req.sessionModel.get('csv-columns') || [];
      if (!csvColumns.length) {
        return next({'bulk-upload-uan': new this.ValidationError('bulk-upload-uan', {
          type: 'processFormatError',
          redirect: undefined
        })});
      }

      // lowercase and trim whitespace to be flexible in case of column name inconsistency
      const transformedColumns = csvColumns.map(column => {
        return column.toLowerCase().trim();
      });

      // checks if csv is missing columns required for processing
      const missingColumns = mandatoryColumns.map(columnName => {
        return transformedColumns.includes(columnName) ? null : columnName;
      }).filter(x => x);

      if (missingColumns.length) {
        if (missingColumns.length === mandatoryColumns.length) {
          return next({'bulk-upload-uan': new this.ValidationError('bulk-upload-uan', {
            type: 'noColumnHeadings',
            redirect: undefined
          })});
        }

        const firstMissingColumn = missingColumns[0];
        let columnError;
        // TODO Update cases below if column names move away from UAN
        switch(firstMissingColumn) {
          case 'uan which has ban alerts under ima 2023':
            columnError = 'missingUanColumn';
            break;
          case 'date of birth':
            columnError = 'missingDobColumn';
            break;
          case 'duty to remove alert':
            columnError = 'missingDtrColumn';
            break;
          default:
            columnError = 'invalidColumns';
        }
        return next({'bulk-upload-uan': new this.ValidationError('bulk-upload-uan', {
          type: columnError,
          redirect: undefined
        })});
      }
    }
    return super.validate(req, res, next);
  }

  async saveValues(req, res, next) {
    const fileToUpload = _.get(req.files, `${fieldName}`);

    if (filevaultUpload) {
      try {
        const filevaultUrl = await this.saveCsvToFilevault(fileToUpload);
        await this.saveCsvUrlToDb(filevaultUrl);
      } catch (error) {
        let uploadValidationError;
        if (error.code === 'VirusFound') {
          uploadValidationError = new this.ValidationError('bulk-upload-uan', {
            type: 'virusFound',
            redirect: undefined
          });
        } else {
          uploadValidationError = new this.ValidationError('bulk-upload-uan', {
            type: 'uploadError',
            redirect: undefined
          });
        }
        return next({'bulk-upload-uan': uploadValidationError});
      }
    }
    return super.saveValues(req, res, next);
  }

  saveCsvToFilevault(file) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('document', new Blob([file.data], { type: 'text/csv' }));

      return this.auth()
        .then(auth => {
          return axios.post(hostname, form, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Basic ${auth.bearer}`
            }
          });
        })
        .then(response => {
          const fileURL = response.data.url;
          logger.log({
            level: 'info',
            message: 'CSV file was successfully uploaded to storage'
          });
          resolve(fileURL);
        })
        .catch(error => {
          // eslint-disable-next-line no-console
          logger.log({
            level: 'error',
            message: `Error uploading CSV via file-vault: ${error}`
          });
          reject(error);
        });
    });
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

  saveCsvUrlToDb(url) {
    return new Promise((resolve, reject) => {
      axios.post(fileSaveUrl, { url: url })
        .then(response => {
          logger.log({
            level: 'info',
            message: 'File store URL was successfully saved to database'
          });
          resolve(response)
        })
        .catch(error => {
          logger.log({
            level: 'error',
            message: `Error saving CSV URL to database: ${error}`
          });
          reject(error);
        });
    });
  }
};
