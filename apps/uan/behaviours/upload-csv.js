/* eslint-disable no-cond-assign */

const _ = require('lodash');
const config = require('../../../config');
const parse = require('csv-parse').parse;
const fs = require('fs/promises');
const path = require('path');
const axios = require('axios');
const Bottleneck = require('bottleneck');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json } = format;

const maxFileSize = config.uanUpload.maxFileSize;
const applicationsUrl = `${config.saveService.host}:${config.saveService.port}/saved_applications`;
const {
  allowedMimeTypes,
  mandatoryColumns,
  recordScanLimit,
  filevaultUpload,
  directUploadToDb,
  writeFileToDataFolder
} = config.uanUpload;

const fileSizeNum = size => size.match(/\d+/g)[0];
const logger = createLogger({
  format: combine(timestamp(), json()),
  transports: [new transports.Console({level: 'info', handleExceptions: true})]
});

module.exports = name => superclass => class extends superclass {
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
    const fileToProcess = _.get(req.files, `${name}`);
    if (fileToProcess) {
      // Stop processing early if the file is not in the correct format
      const { invalidSize, invalidMimetype } = this.checkFileAttributes(fileToProcess);
      if (invalidSize || invalidMimetype) {
        return super.process(req, res, next);
      }
      // set image name on values for filename extension validation
      // N.B. validation controller gets values from
      // req.form.values and not on req.files
      req.form.values[name] = req.files[name].name;
      const records = [];
      const parser = parse({columns: true});

      parser.on('readable', function () {
        let record;
        while ((record = parser.read()) !== null && records.length < parseInt(recordScanLimit, 10)) {
          records.push(record);
        }
      });

      parser.on('error', function (err) {
        req.log('error', err.message);
      });

      await parser.write(req.files[name].data);
      // need to call end() otherwise last record is missed
      parser.end();

      req.sessionModel.set('csv-columns', Object.keys(records[0]) || []);
      if (directUploadToDb) {
        req.sessionModel.set('bulk-records', records);
      }
    }
    return super.process(req, res, next);
  }

  validateField(key, req) {
    const fileToValidate = _.get(req.files, `${name}`);
    req.form.values[name] = req.files[name].name;

    // console.log('UPLOADED', fileToValidate);

    if (fileToValidate) {
      const { invalidSize, invalidMimetype } = this.checkFileAttributes(fileToValidate);
      if (invalidSize || invalidMimetype) {
        return new this.ValidationError('bulk-upload-uan', {
          type: invalidSize ? 'maxFileSize' : 'fileType',
          redirect: undefined
        });
      }

      const csvColumns = req.sessionModel.get('csv-columns');
      if (!csvColumns.length) {
        return new this.ValidationError('bulk-upload-uan', {
          type: 'emptyCsvSheet',
          redirect: undefined
        });
      }

      // lowercase and trim whitespace to be flexible in case of column name inconsistency
      const transformedColumns = csvColumns.map(column => {
        return column.toLowerCase().trim();
      });

      // checks if csv has at least columns needed for processing
      const hasMandatoryColumns = mandatoryColumns.every(column => {
        return transformedColumns.includes(column);
      });

      if (!hasMandatoryColumns) {
        return new this.ValidationError('bulk-upload-uan', {
          type: 'invalidColumns',
          redirect: undefined
        });
      }
    }

    return super.validateField(key, req);
  }

  async saveValues(req, res, next) {
    const fileToUpload = _.get(req.files, `${name}`);
    if (filevaultUpload) {
      return new Promise((resolve, reject) => {
        const form = new FormData();
        form.append('document', new Blob([fileToUpload], { type: 'text/csv' }), 'uan-list.csv');

        this.auth()
          .then(auth => {
            return axios.post(config.upload.hostname, form, {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Basic ${auth.bearer}`
              }
            });
          })
          .then(response => {
            const fileURL = response.data.url;
            const fileUUID = response.data.url.split('/file/')[1].split('?')[0];
            logger.log({
              level: 'info',
              message: `CSV file uploaded, URL is: ${fileURL}, UUID is: ${fileUUID}`
            });
            resolve(fileURL);
          })
          .catch(error => {
            // eslint-disable-next-line no-console
            logger.log({
              level: 'info',
              message: `Error uploading via file-vault CSV: ${error}`
            });
            reject(error);
          });
      });
    }

    if (writeFileToDataFolder) {
      const destinationFilePath = path.join(__dirname, '/../../../data/uan-list.csv');
      try {
        await fs.writeFile(destinationFilePath, fileToUpload.data);
        return super.saveValues(req, res, next);
      } catch (err) {
        return next(err);
      }
    }

    if (directUploadToDb) {
      const limiter = new Bottleneck({
        maxConcurrent: 50,
        minTime: 1000
      });

      const records = req.sessionModel.get('bulk-records');
      const recordColumns = Object.keys(records[0]);
      // lowercase and trim whitespace to be flexible in case of column name inconsistency
      const cleanedRecords = records.map(record => {
        const updatedRecord = {};
        recordColumns.forEach(column => {
          updatedRecord[column.toLowerCase().trim()] = record[column] || null;
          // lowercase email address values to be flexible regarding case inconsistency
          if (updatedRecord['email address']) {
            updatedRecord['email address'] = updatedRecord['email address'].toLowerCase();
          }
        });
        return updatedRecord;
      });

      try {
        await limiter.schedule(() => {
          const submitRecords = cleanedRecords.map(record => {
            return this.submitRecord(record);
          });
          return Promise.all(submitRecords);
        });

        return super.saveValues(req, res, next);
      } catch (e) {
        return next(e);
      }
    }
    return super.saveValues(req, res, next);
  }

  async submitRecord(record) {
    const response = await axios.post(applicationsUrl, {
      uan: record.uan.trim(),
      date_of_birth: record.dob.trim(),
      session: JSON.stringify({})
    });

    const status = response.status;
    return Promise.resolve(status);
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
};
