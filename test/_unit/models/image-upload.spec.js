
'use strict';

const Model = require('../../../apps/ima/models/image-upload');
const config = require('../../../config');

describe('File Upload Model', () => {
  let sandbox;

  beforeEach(function () {
    config.upload.hostname = 'http://file-upload.example.com/file/upload';
    sandbox = sinon.createSandbox();
    sandbox.stub(Model.prototype, 'request').yieldsAsync(null, {
      api: 'response',
      url: '/file/12341212132123?foo=bar'
    });
    sandbox.stub(Model.prototype, 'auth').returns(new Promise(resolve => {
      resolve({bearer: 'myaccesstoken'});
    }));
  });

  afterEach(() => sandbox.restore());

  describe('save', () => {
    it('returns a promise', () => {
      const model = new Model();
      const response = model.save();
      expect(response).to.be.an.instanceOf(Promise);
    });

    it('makes a call to file upload api', () => {
      const model = new Model();
      const response = model.save();
      return response.then(() => {
        expect(model.request).to.have.been.calledOnce;
        expect(model.request).to.have.been.calledWith(sinon.match({
          method: 'POST',
          host: 'file-upload.example.com',
          path: '/file/upload',
          protocol: 'http:'
        }));
      });
    });

    it('adds a formData property to api request with details of uploaded file', () => {
      const uploadedFile = new Model({
        data: 'foo',
        name: 'myfile.png',
        mimetype: 'image/png'
      });
      const response = uploadedFile.save();
      return response.then(() => {
        expect(uploadedFile.request).to.have.been.calledWith(sinon.match({
          formData: {
            document: {
              value: 'foo',
              options: {
                filename: 'myfile.png',
                contentType: 'image/png'
              }
            }
          }
        }));
      });
    });
  });
});
