/* eslint max-len: 0 */
'use strict';

// const Behaviour = require('../../../../apps/uan/behaviours/upload-csv');
const Controller = require('hof').controller;
const proxyquire = require('proxyquire').noCallThru();
const reqres = require('reqres');

describe("apps/uan 'upload-csv' behaviour", () => {
  let req;
  let res;
  let testFile;
  let csvColumns;
  let sessionModel;
  let instance;

  beforeEach(done => {
    const Behaviour = proxyquire('../../../../apps/uan/behaviours/upload-csv',
      {
        '../../ima/index': sinon.stub()
      }
    );

    sessionModel = {
      get: sinon.stub(),
      set: sinon.stub(),
      unset: sinon.stub()
    };
    res = reqres.res();
    req = reqres.req({ sessionModel, files: {}, locals: {} });
    req.form = { values: {}, options: sinon.stub(), files: {} };
    res.redirect = sinon.stub();

    const UploadCSV = Behaviour(Controller);
    instance = new UploadCSV({ template: 'index', route: '/index' });
    instance._configure(req, res, done);

    testFile = {
      data: Buffer.from(`
      comma,separated,heading
      comma,separated,values
      `),
      name: 'test.csv',
      encoding: '7bit',
      mimetype: 'text/csv',
      truncated: false,
      size: 114
    };

    csvColumns = [
      'UAN which has BAN alerts under IMA 2023',
      'Date of birth',
      'Duty to remove Alert'
    ];
  });

  describe("The upload-csv 'checkFileAttributes' method", () => {
    it('Returns an object with the correct properties', () => {
      const fileAttributes = instance.checkFileAttributes(testFile);
      fileAttributes.should.be.a('object');
      fileAttributes.should.have.property('invalidMimetype');
      fileAttributes.should.have.property('invalidSize');
      Object.keys(fileAttributes).should.have.lengthOf(2);
    });

    it('Returns both properties as false with a well formatted file', () => {
      const fileAttributes = instance.checkFileAttributes(testFile);
      fileAttributes.invalidMimetype.should.equal(false);
      fileAttributes.invalidSize.should.equal(false);
    });

    it("Returns true for 'invalidMimetype' if the file is not CSV", () => {
      testFile.mimetype = 'wrong/mimetype';
      const fileAttributes = instance.checkFileAttributes(testFile);
      fileAttributes.invalidMimetype.should.equal(true);
      fileAttributes.invalidSize.should.equal(false);
    });

    it("Returns true for 'invalidFileSize' if the file is too big", () => {
      testFile.size = 100000000000;
      const fileAttributes = instance.checkFileAttributes(testFile);
      fileAttributes.invalidMimetype.should.equal(false);
      fileAttributes.invalidSize.should.equal(true);
    });
  });

  describe("The upload-csv '.validateField' method", () => {
    it('Should not return an error if the file is properly formatted', () => {
      req.sessionModel.get.withArgs('csv-columns').returns(csvColumns);
      req.files['bulk-upload-uan'] = testFile;
      instance.validate(req, res, err => {
        should.not.exist(err);
      });
    });

    it("returns a fileType error if the 'bulk-upload-uan' file field has the wrong mimetype'", () => {
      testFile.mimetype = 'wrong/mimetype';
      req.files['bulk-upload-uan'] = testFile;
      instance.validate(req, res, err => {
        err['bulk-upload-uan'].should.be.an.instanceof(instance.ValidationError);
        err['bulk-upload-uan'].should.have.property('type').and.equal('fileType');
      });
    });

    it("returns a maxFileSize error if the 'bulk-upload-uan' file field has an invalid size'", () => {
      testFile.size = 100000000000;
      req.files['bulk-upload-uan'] = testFile;
      instance.validate(req, res, err => {
        err['bulk-upload-uan'].should.be.an.instanceof(instance.ValidationError);
        err['bulk-upload-uan'].should.have.property('type').and.equal('maxFileSize');
      });
    });

    it("returns an emptyFile error if the 'bulk-upload-uan' file field has no data'", () => {
      testFile.data = null;
      req.files['bulk-upload-uan'] = testFile;
      instance.validate(req, res, err => {
        err['bulk-upload-uan'].should.be.an.instanceof(instance.ValidationError);
        err['bulk-upload-uan'].should.have.property('type').and.equal('emptyFile');
      });
    });

    it("returns a processFormatError error if processing detects a general format error'", () => {
      req.sessionModel.get.withArgs('csv-columns').returns([]);
      req.files['bulk-upload-uan'] = testFile;
      instance.validate(req, res, err => {
        err['bulk-upload-uan'].should.be.an.instanceof(instance.ValidationError);
        err['bulk-upload-uan'].should.have.property('type').and.equal('processFormatError');
      });
    });

    it("returns a noColumnHeadings error if processing detects none of the mandatory columns'", () => {
      req.sessionModel.get.withArgs('csv-columns').returns(['a', 'b', 'c']);
      req.files['bulk-upload-uan'] = testFile;
      instance.validate(req, res, err => {
        err['bulk-upload-uan'].should.be.an.instanceof(instance.ValidationError);
        err['bulk-upload-uan'].should.have.property('type').and.equal('noColumnHeadings');
      });
    });

    it("returns a missingUanColumn error if processing does not detect that column'", () => {
      csvColumns.shift();
      req.sessionModel.get.withArgs('csv-columns').returns(csvColumns);
      req.files['bulk-upload-uan'] = testFile;
      instance.validate(req, res, err => {
        err['bulk-upload-uan'].should.be.an.instanceof(instance.ValidationError);
        err['bulk-upload-uan'].should.have.property('type').and.equal('missingUanColumn');
      });
    });
  });
});
