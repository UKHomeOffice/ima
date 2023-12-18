'use strict';

const redis = require('./redis');

/**
 * Read token from redis
 *
 * @param {string} token - token used to verify user
 */
const read = async token => {
  const [valid, name, email, uam, _dateOfBirth] = await Promise.all([
    redis.get(`token:${token}`),
    redis.get(`${token}:email`),
    redis.get(`${token}:uan`),
    redis.get(`${token}:date-of-birth`),
  ]);

  return {
    valid,
    name,
    email,
    uam,
    'date-of-birth': _dateOfBirth,
  };
};

/**
 * Remove token from redis
 *
 * @param {string} token - token used to verify user
 */
const remove = token => {
  redis.del(`token:${token}`);
};

module.exports = {
  // check the token is in redis
  // catch is dealt with later by whatever calls this promise
  read,
  delete: remove
};
