'use strict';

const redis = sinon.stub();
const proxyquire = require('proxyquire').noCallThru();
const Db = proxyquire('../../../db/get-token',
  {
    './redis': redis
  });

describe('db/get-token', () => {
  describe('read()', () => {
    beforeEach(() => {
      sinon.stub(redis, 'get');
    });

    afterEach(() => {
      redis.get.restore();
    });

    it('is a function', () => {
      expect(Db.read).to.be.a('function');
    });

    it('returns a valid user when it finds a token in redis', async () => {
      const token = 'test';
      redis.get.withArgs('token:test').returns(token);
      redis.get.withArgs('test:email').returns('s@mail.com');
      redis.get.withArgs('test:uan').returns('1234-5678-9101-1121');
      redis.get.withArgs('test:date-of-birth').returns('2000/01/01');

      const expected = {
        valid: 'test',
        email: 's@mail.com',
        uan: '1234-5678-9101-1121',
        'date-of-birth': '2000/01/01'
      };

      try {
        const result = await Db.read('test');
        expect(result).to.deep.equal(expected);
      } catch (err) {
        throw new Error(err);
      }
    });

    it('returns user with no valid properties when it does NOT find a token in redis', async () => {
      redis.get.resolves(undefined);

      const expected = {
        valid: undefined,
        email: undefined,
        uan: undefined,
        'date-of-birth': undefined
      };

      try {
        const result = await Db.read('test');
        await expect(result).to.deep.equal(expected);
      } catch (err) {
        throw new Error(err);
      }
    });
  });

  describe('delete()', () => {
    it('is a function', () => {
      expect(Db.delete).to.be.a('function');
    });
  });
});
