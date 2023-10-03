'use strict';

const redis = require('./redis');
const uuidv1 = require('uuid').v1;
const tokenExpiry = require('../config').login.tokenExpiry;

module.exports = {
  save(req, email) {
    const token = uuidv1();
    redis.set(`token:${token}`, token);
    redis.set(`${token}:email`, email);
    redis.set(`${token}:uan`, req.sessionModel.get('uan'));
    redis.set(`${token}:date-of-birth`, req.sessionModel.get('date-of-birth'));
    redis.expire(`token:${token}`, tokenExpiry);
    redis.expire(`${token}:email`, tokenExpiry);
    redis.expire(`${token}:uan`, tokenExpiry);
    redis.expire(`${token}:date-of-birth`, tokenExpiry);

    return token;
  }
};
