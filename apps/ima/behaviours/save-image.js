'use strict';

const _ = require('lodash');
const config = require('../../../config');
const Model = require('../models/image-upload');

const fileSizeNum = size => size.match(/\d+/g)[0];

module.exports = name => superclass => class extends superclass {
  process(req) {
    if (req.files && req.files[name]) {
      // set image name on values for filename extension validation
      // N:B validation controller gets values from
      // req.form.values and not on req.files
      req.form.values[name] = req.files[name].name;
      req.log('info', `Submission ID: ${req.sessionModel.get('submissionID')},
                       Processing image: ${req.form.values[name]}`);
    }
    super.process.apply(this, arguments);
  }

  locals(req, res, next) {
    const maxNum = fileSizeNum(config.upload.maxFileSize);
    const maxSize = config.upload.maxFileSize.match(/[a-zA-Z]+/g)[0].toUpperCase();

    return Object.assign({}, super.locals(req, res, next), {
      maxFileSize: `${maxNum} ${maxSize}`
    });
  }

  validateField(key, req) {
    if (req.body['upload-file']) {
      const fileUpload = _.get(req.files, `${name}`);

      if (fileUpload) {
        const uploadSize = fileUpload.size;
        const mimetype = fileUpload.mimetype;
        const uploadSizeTooBig = uploadSize > (fileSizeNum(config.upload.maxFileSize) * 1000000);
        const uploadSizeBeyondServerLimits = uploadSize === null;
        const invalidMimetype = !config.upload.allowedMimeTypes.includes(mimetype);
        const invalidSize = uploadSizeTooBig || uploadSizeBeyondServerLimits;

        if (invalidSize || invalidMimetype) {
          return new this.ValidationError('image', {
            type: invalidSize ? 'maxFileSize' : 'fileType',
            redirect: undefined
          });
        }
      } else {
        return new this.ValidationError('image', {
          type: 'required',
          redirect: undefined
        });
      }
    }

    return super.validateField(key, req);
  }

  saveValues(req, res, next) {
    if (req.body['upload-file']) {
      const noImagesToUpload = req.form.values['evidence-upload'] === 'no';
      const noMoreImagesToUpload = req.form.values['evidence-upload-more'] === 'no';
      const noImagesInSession = !_.get(req.sessionModel.get('images'), 'length');
      const steps = req.sessionModel.get('steps');
      const lateSubmissionDetails = req.form.values['late-submission'];

      if(lateSubmissionDetails) {
        req.sessionModel.set('late-submission', lateSubmissionDetails);
      }

      if (noImagesToUpload || (noMoreImagesToUpload && noImagesInSession)) {
        req.sessionModel.set('evidence-upload', 'no');
        req.sessionModel.set('steps', steps.filter(s => s !== '/evidence-details'));
        req.sessionModel.unset(['images']);
        return super.saveValues(req, res, next);
      }
      req.sessionModel.set('evidence-upload', 'yes');

      const images = req.sessionModel.get('images') || [];

      if (_.get(req.files, `${name}`)) {
        req.log('info', `Submission ID: ${req.sessionModel.get('submissionID')},
          Saving image: ${req.files[name].name}`);
        const image = _.pick(req.files[name], ['name', 'data', 'mimetype']);
        const model = new Model(image);
        return model.save()
          .then(() => {
            req.sessionModel.set('images', [...images, model.toJSON()]);
            if (req.form.options.route === '/evidence-upload') {
              res.redirect('/ima/evidence-upload');
            } else if (req.form.options.route === '/submitting-late-details') {
              res.redirect('/ima/submitting-late-details');
            }
            return super.saveValues(req, res, next);
          })
          .catch(next);
      }
    }
    return super.saveValues.apply(this, arguments);
  }
};
