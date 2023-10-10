'use strict';

const config = require('../../../../config');
const reqres = require('reqres');
const proxyquire = require('proxyquire').noCallThru();
const NotifyClient = require('notifications-node-client').NotifyClient;
const baseUrl = `${config.saveService.host}:${config.saveService.port}/saved_applications`;
const tokenGenerator = {
  save: sinon.stub()
};

// we need to proxyquire for multiple dependencies
// As soon as you require one of these it tries to create a Redis
// connection. We do not want Redis as a dependency of our unit tests.
// Therefore stub it before it gets to that
const Behaviour = proxyquire('../../../../apps/verify/behaviours/send-verification-email',
  {
    '../db/save-token': tokenGenerator,
    '../../ima/index': sinon.stub(),
    '../../../config': Object.assign({}, config, {
      login: {
        appPath: '/ima/start',
        allowSkip: true,
        skipEmail: 'test@digital.homeoffice.gov.uk'
      },
      saveService: {
        port: 3001,
        host: 'http://127.0.0.1'
      }
    })
  });

describe('apps/verify/behaviours/send-verification-email', () => {
  it('exports a function', () => {
    expect(Behaviour).to.be.a('function');
  });


  class Base {
    saveValues() { }
    getNextStep() { }
  }

  let req;
  let res;
  let sessionModel;
  let SendVerificationEmail;
  let instance;

  beforeEach(() => {
    sessionModel = {
      get: sinon.stub(),
      set: sinon.stub(),
      unset: sinon.stub()
    };
    res = reqres.res();
    req = reqres.req({ sessionModel });
    req.form = { values: {} };
    res.redirect = sinon.stub();

    SendVerificationEmail = Behaviour(Base);
    instance = new SendVerificationEmail();
  });

  describe('getNextStep()', () => {
    beforeEach(() => {
      sinon.stub(Base.prototype, 'getNextStep');
    });
    afterEach(() => {
      Base.prototype.getNextStep.restore();
    });

    it('does not call the parent method when email auth is skipped with correct email', () => {
      req.form.values['user-email'] = 'sas-hof-test@digital.homeoffice.gov.uk';

      instance.getNextStep(req, res);

      Base.prototype.getNextStep.should.not.have.been.called;
      res.redirect.should.have.been.calledOnce.calledWithExactly('/ima/start?token=skip');
    });

    it('calls the parent method when skip email auth is allowed but with incorrect email', () => {
      req.form.values['user-email'] = 'bad-email@digital.homeoffice.gov.uk';

      instance.getNextStep(req, res);

      Base.prototype.getNextStep.should.have.been.calledWith(req, res);
      res.redirect.should.not.have.been.called;
    });
  });

  describe.only('saveValues()', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox.stub(Base.prototype, 'saveValues').yields();
      sandbox.stub(NotifyClient.prototype, 'sendEmail').resolves('email sent');
    });

    afterEach(function () {
      sandbox.restore();
    });

    it('sends an email', done => {
      req.get.withArgs('host').returns('localhost');
      req.form.values['user-email'] = 'sas-hof-test@digital.homeoffice.gov.uk';
      req.sessionModel.get.withArgs('uan').returns('9876-1234-1234-5678');
      const data = [{
        id: 12,
        created_at: '2023-10-09T17:51:38.339Z',
        updated_at: '2023-10-09T21:59:32.903Z',
        caseworker_id: 1,
        uan: '9876-1234-1234-5678',
        email: [null],
        date_of_birth: '2000/01/01',
        session: '{}',
        expires_at: '2025-10-08'
      }];
      const updatedData = [{
        id: 12,
        created_at: '2023-10-09T17:51:38.339Z',
        updated_at: '2023-10-09T21:59:32.903Z',
        caseworker_id: 1,
        uan: '9876-1234-1234-5678',
        email: 'test@digital.homeoffice.gov.uk',
        date_of_birth: '2000/01/01',
        session: '{}',
        expires_at: '2025-10-08'
      }];
      const email = req.form.values['user-email'];
      let axiosStub = {
        get: () => {
          return Promise.resolve({ data: data });
        },
        patch: () => {
          return Promise.resolve({ data: updatedData });
        }
      };

      instance.saveValues(req, res, async () => {
        req.get.withArgs('host').returns('localhost');
        await axiosStub.get(baseUrl + '/uan/' + req.sessionModel.get('uan'))
        await axiosStub.patch(baseUrl + "/" + data[0].id, { data: { email } });
        NotifyClient.prototype.sendEmail.should.have.been.calledOnce;
        done();
      }).catch(done);
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
