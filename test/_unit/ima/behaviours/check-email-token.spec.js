/* eslint-disable no-console */
'use strict';

// const config = require('../../../../config');
const reqres = require('reqres');
const proxyquire = require('proxyquire').noCallThru();

const getTokenStub = {
  read: sinon.stub(),
  delete: sinon.stub()
};
const configStub = {
  login: {}
};

// we need to proxyquire checkToken model rather than requiring and then using sinon.
// As soon as you require the checkToken it tries to create a Redis connection. We do not
// want Redis as a dependency of our unit tests. Therefore stub it before it gets to that
const Behaviour = proxyquire('../../../../apps/ima/behaviours/check-email-token', {
  '../../db/get-token': getTokenStub,
  '../../../config': configStub
});

describe('apps/ima/behaviours/check-email-token', () => {
  it('exports a function', () => {
    expect(Behaviour).to.be.a('function');
  });

  let req;
  let res;
  let sessionModel;
  let CheckEmailToken;
  let instance;
  let session;

  class Base {
    saveValues() { }
  }

  beforeEach(() => {
    sessionModel = {
      get: sinon.stub(),
      set: sinon.stub()
    };
    session = {
      'hof-wizard-verify': {}
    };
    res = reqres.res();
    req = reqres.req({ sessionModel, session });
    CheckEmailToken = Behaviour(Base);
    instance = new CheckEmailToken();
  });

  describe('saveValues()', () => {
    beforeEach(() => {
      sinon.stub(Base.prototype, 'saveValues');
    });
    afterEach(() => {
      Base.prototype.saveValues.restore();
    });

    describe('does NOT bypass email authentication', () => {
      it('has NO allowSkip flag', () => {
        getTokenStub.read.withArgs('skip').resolves({});
        req.query = {
          token: 'skip'
        };
        configStub.login.skipEmail = 'ronald@gmail.com';
        configStub.login.allowSkip = false;
        instance.saveValues(req, res);
        Base.prototype.saveValues.should.not.have.been.calledWith(req, res);
      });

      it('has allowSkip flag set to TRUE but no email environment variable or email params', () => {
        getTokenStub.read.withArgs('skip').resolves({});
        req.query = {
          token: 'skip'
        };
        configStub.login.allowSkip = true;
        configStub.login.skipEmail = '';
        instance.saveValues(req, res);
        Base.prototype.saveValues.should.not.have.been.calledWith(req, res);
      });
    });

    describe('bypasses email authentication', () => {
      it('when we provide a skip token, allowSkip, & skip email environment variable', () => {
        req.session['hof-wizard-verify'].uan = '1904-5678-9101-1121';
        req.query = {
          token: 'skip'
        };
        configStub.login.skipEmail = 'ronda@gmail.com';
        configStub.login.allowSkip = true;
        instance.saveValues(req, res);

        Base.prototype.saveValues.should.have.been.calledWith(req, res);
      });

      it('bypasses email authentication when there is already a valid token', () => {
        req.sessionModel.get.withArgs('valid-token').returns(true);

        instance.saveValues(req, res);

        Base.prototype.saveValues.should.have.been.calledWith(req, res);
      });
    });

    describe('when it bypasses the email authentication', () => {
      it('sets the user email based on the email params if it bypasses the email authentication', () => {
        req.session['hof-wizard-verify'].uan = '1904-5678-9101-1121';
        req.session['hof-wizard-verify']['date-of-birth'] = '2000/01/01';
        req.query = {
          token: 'skip'
        };
        configStub.login.skipEmail = 'wanda@mail.com';
        configStub.login.allowSkip = true;
        instance.saveValues(req, res);
        expect(sessionModel.set).to.have.been.calledWith('user-email', 'wanda@mail.com');
        expect(sessionModel.set).to.have.been.calledWith('uan', '1904-5678-9101-1121');
        expect(sessionModel.set).to.have.been.calledWith('date-of-birth', '2000/01/01');
      });

      it('sets the user email based on the skipEmail environment variable if', () => {
        req.session['hof-wizard-verify'].uan = '1234-5678-9101-1121';
        req.session['hof-wizard-verify']['date-of-birth'] = '2000/01/01';
        req.query = {
          token: 'skip'
        };
        configStub.login.allowSkip = true;
        configStub.login.skipEmail = 'pparker@gmail.com';
        instance.saveValues(req, res);
        expect(sessionModel.set).to.have.been.calledWith('user-email', 'pparker@gmail.com');
        expect(sessionModel.set).to.have.been.calledWith('uan', '1234-5678-9101-1121');
        expect(sessionModel.set).to.have.been.calledWith('date-of-birth', '2000/01/01');
      });
    });
  });
});
