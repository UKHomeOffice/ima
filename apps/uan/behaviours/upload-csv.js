/* eslint-disable no-cond-assign */

const _ = require('lodash');
const config = require('../../../config');
const parse = require('csv-parse').parse;
const fs = require('fs/promises');
const axios = require('axios');
const Bottleneck = require('bottleneck');

const maxFileSize = config.uanUpload.maxFileSize;
const applicationsUrl = `${config.saveService.host}:${config.saveService.port}/saved_applications`;
const {
  allowedMimeTypes,
  mandatoryColumns,
  recordScanLimit,
  directUpload,
  destinationFilePath
} = config.uanUpload;

const fileSizeNum = size => size.match(/\d+/g)[0];

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
    }
  }

  async process(req, res, next) {
    const fileToProcess = _.get(req.files, `${name}`);
    if (fileToProcess) {
      // Stop processing early if the file is not in the correct format
      const { invalidSize, invalidMimetype } = this.checkFileAttributes(fileToProcess);
      if (invalidSize || invalidMimetype) {
        return super.process(req, res, next)
      }
      // set image name on values for filename extension validation
      // N.B. validation controller gets values from
      // req.form.values and not on req.files
      req.form.values[name] = req.files[name].name;
      const records = [];
      const parser = parse({columns: true});

      parser.on('readable', function () {
        let record;
        while ((record = parser.read()) !== null && records.length < parseInt(recordScanLimit)) {
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
      if (directUpload) {
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
        return column.toLowerCase().trim()
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
    if (!directUpload) {
      const fileToUpload = _.get(req.files, `${name}`);

      try {
        await fs.writeFile(destinationFilePath, fileToUpload.data);
        return super.saveValues(req, res, next);
      } catch (err) {
        return next(err);
      }
    }

    if (directUpload) {
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
          return Promise.all(submitRecords)
        });

        return super.saveValues(req, res, next);
      } catch (e) {
        return next(e);
      }
    }
  }

  async submitRecord(record) {
    const response = await axios.post(applicationsUrl, {
      uan: record['uan'].trim(),
      date_of_birth: record['dob'].trim(),
      session: JSON.stringify({}),
    });

    const status = response.status;
    return Promise.resolve(status);
  }
};
