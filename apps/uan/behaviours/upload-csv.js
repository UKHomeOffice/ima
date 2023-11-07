/* eslint-disable no-cond-assign */

const _ = require('lodash');
const config = require('../../../config');
const parse = require('csv-parse').parse;
const maxFileSize = config.recruiterUploads.maxFileSize;
const allowedMimeTypes = config.recruiterUploads.allowedMimeTypes;
const mandatoryColumns = config.recruiterUploads.mandatoryColumns;
const applicantColumns = config.recruiterUploads.applicantColumns;
const referenceColumns = config.recruiterUploads.referenceColumns;

const fileSizeNum = size => size.match(/\d+/g)[0];

module.exports = name => superclass => class extends superclass {
  getValues(req, res, next) {
    const host = req.get('host');
    const isLocalhost = host.includes('localhost');
    const recruiterEmail = isLocalhost ? config.login.skipEmail : req.headers['x-auth-email'];

    req.sessionModel.set('recruiter-email', recruiterEmail);
    return super.getValues(req, res, next);
  }

  locals(req, res, next) {
    const maxNum = fileSizeNum(maxFileSize);
    const maxSize = maxFileSize.match(/[a-zA-Z]+/g)[0].toUpperCase();

    return Object.assign({}, super.locals(req, res, next), {
      maxFileSize: `${maxNum} ${maxSize}`
    });
  }

  async process(req, res, next) {
    const file = _.get(req, `files[${name}]`);

    if (file) {
      // set image name on values for filename extension validation
      // N.B. validation controller gets values from
      // req.form.values and not on req.files
      req.form.values[name] = req.files[name].name;

      const records = [];
      const parser = parse({ columns: true });

      parser.on('readable', function () {
        let record;
        while ((record = parser.read()) !== null) {
          records.push(record);
        }
      });

      parser.on('error', function (err) {
        req.log('error', err.message);
      });

      await parser.write(req.files[name].data);
      // need to call end() otherwise last record is missed
      parser.end();

      req.sessionModel.set('bulk-records', records);
    }
    return super.process(req, res, next);
  }

  validateField(key, req) {
    const fileUpload = _.get(req.files, `${name}`);

    if (fileUpload) {
      const uploadSize = fileUpload.size;
      const mimetype = fileUpload.mimetype;
      const uploadSizeTooBig = uploadSize > (fileSizeNum(maxFileSize) * 1000000);
      const uploadSizeBeyondServerLimits = uploadSize === null;
      const invalidMimetype = !allowedMimeTypes.includes(mimetype);
      const invalidSize = uploadSizeTooBig || uploadSizeBeyondServerLimits;

      if (invalidSize || invalidMimetype) {
        return new this.ValidationError('bulk-upload-candidates', {
          type: invalidSize ? 'maxFileSize' : 'fileType',
          redirect: undefined
        });
      }

      const bulkRecords = req.sessionModel.get('bulk-records') || [];

      if (!bulkRecords.length) {
        return new this.ValidationError('bulk-upload-candidates', {
          type: 'emptyCsvSheet',
          redirect: undefined
        });
      }

      const recordColumns = Object.keys(bulkRecords[0]);
      // lowercase and trim whitespace to be flexible in case of column name inconsistency
      const transformedRecords = bulkRecords.map(record => {
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

      // checks if csv has at least columns needed for processing
      const hasMandatoryColumns = applicantColumns.every(column => {
        return Object.keys(transformedRecords[0]).includes(column);
      });

      if (!hasMandatoryColumns) {
        return new this.ValidationError('bulk-upload-candidates', {
          type: 'invalidColumns',
          redirect: undefined
        });
      }
      const rowNumberCount = {};
      // picks out mandatory columns and count of values
      mandatoryColumns.forEach(column => {
        rowNumberCount[column] = transformedRecords.map(record => record[column]).filter(o => o).length;
      });

      const hasMissingValues = _.uniq(Object.values(rowNumberCount)).length > 1;

      if (hasMissingValues) {
        return new this.ValidationError('bulk-upload-candidates', {
          type: 'missingValues',
          redirect: undefined
        });
      }

      const rowReferences = transformedRecords.map(record => {
        const recordRefValues = [];
        referenceColumns.forEach(column => {
          recordRefValues.push(!!record[column]);
        });
        return recordRefValues.every(item => !item);
      });

      if (rowReferences.includes(true)) {
        return new this.ValidationError('bulk-upload-candidates', {
          type: 'missingReference',
          redirect: undefined
        });
      }

      const applicantIds = transformedRecords.map(obj => obj['applicant id']).filter(id => id);
      const { applicantIdFormatRules } = config.recruiterUploads;
      const hasBadApplicantId = applicantIds.find(id => !id.match(applicantIdFormatRules));
      if (hasBadApplicantId) {
        return new this.ValidationError('bulk-upload-candidates', {
          type: 'hasBadApplicantId',
          redirect: undefined
        });
      }

      const uniqCases = _.uniqBy(transformedRecords, obj => {
        return obj.name + obj['applicant id'] + obj['job role'] + obj['email address'];
      });
      const hasDuplicateEntries = uniqCases.length !== transformedRecords.length;

      if (hasDuplicateEntries) {
        return new this.ValidationError('bulk-upload-candidates', {
          type: 'hasDuplicates',
          redirect: undefined
        });
      }

      req.sessionModel.set('bulk-records', transformedRecords);
    }
    return super.validateField(key, req);
  }
};
