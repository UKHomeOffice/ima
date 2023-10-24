'use strict';

const config = require('../../../../config');
const reqres = require('reqres');
const proxyquire = require('proxyquire').noCallThru();
const Controller = require('hof').controller;
const NotifyClient = require('notifications-node-client').NotifyClient;

describe('apps/verify/behaviours/send-verification-email', () => {
  let axiosGetStub;
  let req;
  let res;
  let sessionModel;
  let instance;

  beforeEach(done => {
    axiosGetStub = sinon.stub();

    // we need to proxyquire for multiple dependencies
    // As soon as you require one of these it tries to create a Redis
    // connection. We do not want Redis as a dependency of our unit tests.
    // Therefore stub it before it gets to that
    const Behaviour = proxyquire('../../../../apps/verify/behaviours/send-verification-email',
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
          get: axiosGetStub
        },
      });
    sessionModel = {
      get: sinon.stub(),
      set: sinon.stub(),
      unset: sinon.stub()
    };
    res = reqres.res();
    req = reqres.req({ sessionModel });
    req.form = { values: {} };
    res.redirect = sinon.stub();

    const SendVerificationEmail = Behaviour(Controller);
    instance = new SendVerificationEmail({ template: 'index', route: '/index' });
    instance._configure(req, res, done);
  });

  afterEach(async () => {
    axiosGetStub.reset();
  });

  describe('getNextStep()', () => {
    beforeEach(() => {
      sinon.stub(Controller.prototype, 'getNextStep');
    });
    afterEach(() => {
      Controller.prototype.getNextStep.restore();
    });

    it('does not call the parent method when email auth is skipped with correct email', () => {
      req.form.values['user-email'] = 'test@digital.homeoffice.gov.uk';

      instance.getNextStep(req, res);

      Controller.prototype.getNextStep.should.not.have.been.called;
      res.redirect.should.have.been.calledOnce.calledWithExactly('/ima/start?token=skip');
    });

    it('calls the parent method when skip email auth is allowed but with incorrect email', () => {
      req.form.values['user-email'] = 'bad-email@digital.homeoffice.gov.uk';

      instance.getNextStep(req, res);

      Controller.prototype.getNextStep.should.have.been.calledWith(req, res);
      res.redirect.should.not.have.been.called;
    });
  });

  describe('saveValues()', () => {
    let sandbox;
    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox.stub(NotifyClient.prototype, 'sendEmail').resolves('email sent');
    });

    afterEach(function () {
      sandbox.restore();
      axiosGetStub.reset();
    });

    it('sends an email for an application', done => {
      req.get.withArgs('host').returns('localhost');
      req.sessionModel.get.withArgs('uan').returns('1876-1234-1234-5678');
      const data = [];
      axiosGetStub.resolves({ data: data });
      req.form.values['user-email'] = 'buzz@lightyear.co.uk';

      instance.saveValues(req, res, () => {
        NotifyClient.prototype.sendEmail.should.have.been.called;
        done();
      }).catch(done);
    });

    it('throw a validation error if the incorrect email is used for an existing application', done => {
      req.get.withArgs('host').returns('localhost');
      // req.form.values['user-email'] = 'sas-hof-test@digital.homeoffice.gov.uk';
      const data = [
        {
          "id": 12,
          "created_at": '2023-10-09T17:51:38.339Z',
          "updated_at": '2023-10-09T21:59:32.903Z',
          "uan": '9876-1234-1234-5678',
          "email": 'marvel@test.com',
          "date_of_birth": '2000/01/01',
          "session": '{}',
          "expires_at": '2025-10-08'
        }
      ]
      axiosGetStub.resolves({ data: data });
      instance.saveValues(req, res, err => {
        err['user-email'].should.be.an.instanceof(instance.ValidationError);
        err['user-email'].should.have.property('type').and.equal('noRecordMatch');
        NotifyClient.prototype.sendEmail.should.not.have.been.called;
        done();
      })
        .catch(done);
    });

    it('skips calling data service when email auth skip is allowed with correct email', done => {
      req.get.withArgs('host').returns('localhost');
      req.form = {
        values: {
          'user-email': 'test@digital.homeoffice.gov.uk'
        }
      };
      instance.saveValues(req, res, () => {
        NotifyClient.prototype.sendEmail.should.not.have.been.called;
        done();
      }).catch(done);
    });
  });
});
