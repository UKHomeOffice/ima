/* eslint max-len: 0 */
'use strict';

const Controller = require('hof').controller;
const proxyquire = require('proxyquire').noCallThru();
const reqres = require('reqres');

describe("apps/cepr 'upload-csv' behaviour", () => {
  let req;
  let res;
  let testFile;
  let csvColumns;
  let sessionModel;
  let instance;
  let axiosGetStub;
  let axiosPostStub;

  beforeEach(done => {
    axiosGetStub = sinon.stub();
    axiosPostStub = sinon.stub();

    const Behaviour = proxyquire('../../../../apps/cepr/behaviours/upload-csv',
      {
        '../../ima/index': sinon.stub(),
        '../../../config': Object.assign({}, config, {
          login: {
            appPath: '/ima/start',
            allowSkip: true,
            skipEmail: 'test@digital.homeoffice.gov.uk'
          },
          saveService: {
            host: 'https://data-service.com',
            port: 3001
          }
        }),
        axios: {
          get: axiosGetStub,
          post: axiosPostStub
        }
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
      comma,separated,headings
      comma,separated,values
      `),
      name: 'test.csv',
      encoding: '7bit',
      mimetype: 'text/csv',
      truncated: false,
      size: 114
    };

    csvColumns = [
      'CEPR for banned under the IMA2023',
      'DOB',
      'Duty to remove alert'
    ];
  });

  afterEach(async () => {
    axiosGetStub.reset();
    axiosPostStub.reset();
  });

  describe("The upload-csv 'checkFileAttributes' method", () => {
    // it('Returns an object with the correct properties', () => {
    //   const fileAttributes = instance.checkFileAttributes(testFile);
    //   fileAttributes.should.be.a('object');
    //   fileAttributes.should.have.property('invalidMimetype');
    //   fileAttributes.should.have.property('invalidSize');
    //   Object.keys(fileAttributes).should.have.lengthOf(2);
    // });

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
      req.files['bulk-upload-cepr'] = testFile;
      instance.validate(req, res, err => {
        should.not.exist(err);
      });
    });

    it("returns a fileType error if the 'bulk-upload-cepr' file field has the wrong mimetype'", () => {
      testFile.mimetype = 'wrong/mimetype';
      req.files['bulk-upload-cepr'] = testFile;
      instance.validate(req, res, err => {
        err['bulk-upload-cepr'].should.be.an.instanceof(instance.ValidationError);
        err['bulk-upload-cepr'].should.have.property('type').and.equal('fileType');
      });
    });

    it("returns a maxFileSize error if the 'bulk-upload-cepr' file field has an invalid size'", () => {
      testFile.size = 100000000000;
      req.files['bulk-upload-cepr'] = testFile;
      instance.validate(req, res, err => {
        err['bulk-upload-cepr'].should.be.an.instanceof(instance.ValidationError);
        err['bulk-upload-cepr'].should.have.property('type').and.equal('maxFileSize');
      });
    });

    it("returns an emptyFile error if the 'bulk-upload-cepr' file field has no data'", () => {
      testFile.data = null;
      req.files['bulk-upload-cepr'] = testFile;
      instance.validate(req, res, err => {
        err['bulk-upload-cepr'].should.be.an.instanceof(instance.ValidationError);
        err['bulk-upload-cepr'].should.have.property('type').and.equal('emptyFile');
      });
    });

    it("returns a processFormatError error if processing detects a general format error'", () => {
      req.sessionModel.get.withArgs('csv-columns').returns([]);
      req.files['bulk-upload-cepr'] = testFile;
      instance.validate(req, res, err => {
        err['bulk-upload-cepr'].should.be.an.instanceof(instance.ValidationError);
        err['bulk-upload-cepr'].should.have.property('type').and.equal('processFormatError');
      });
    });

    it("returns a noColumnHeadings error if processing detects none of the mandatory columns'", () => {
      req.sessionModel.get.withArgs('csv-columns').returns(['a', 'b', 'c']);
      req.files['bulk-upload-cepr'] = testFile;
      instance.validate(req, res, err => {
        err['bulk-upload-cepr'].should.be.an.instanceof(instance.ValidationError);
        err['bulk-upload-cepr'].should.have.property('type').and.equal('noColumnHeadings');
      });
    });

    it("returns a missingCeprColumn error if processing does not detect that column'", () => {
      csvColumns.shift();
      req.sessionModel.get.withArgs('csv-columns').returns(csvColumns);
      req.files['bulk-upload-cepr'] = testFile;
      instance.validate(req, res, err => {
        err['bulk-upload-cepr'].should.be.an.instanceof(instance.ValidationError);
        err['bulk-upload-cepr'].should.have.property('type').and.equal('missingCeprColumn');
      });
    });
  });
});
