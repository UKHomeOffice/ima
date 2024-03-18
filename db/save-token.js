'use strict';

const redis = require('./redis');
const uuidv1 = require('uuid').v1;
const tokenExpiry = require('../config').login.tokenExpiry;

module.exports = {
  save(req, email) {
    const token = uuidv1();
    redis.set(`token:${token}`, token);
    redis.set(`${token}:email`, email);
    redis.set(`${token}:cepr`, req.sessionModel.get('cepr'));
    redis.set(`${token}:date-of-birth`, req.sessionModel.get('date-of-birth'));
    redis.set(`${token}:duty-to-remove-alert`, req.sessionModel.get('duty-to-remove-alert'));
    redis.expire(`token:${token}`, tokenExpiry);
    redis.expire(`${token}:email`, tokenExpiry);
    redis.expire(`${token}:cepr`, tokenExpiry);
    redis.expire(`${token}:date-of-birth`, tokenExpiry);
    redis.expire(`${token}:duty-to-remove-alert`, tokenExpiry);

    console.log("REDIS" + redis.get(`${token}`));

    return token;
  }
};
