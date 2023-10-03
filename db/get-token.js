'use strict';

const redis = require('./redis');

/**
 * Read token from redis
 *
 * @param {string} token - token used to verify user
 */
const read = async token => {
  const user = {};
  user.valid = await redis.get(`token:${token}`);
  user.email = await redis.get(`${token}:email`);
  user.uan = await redis.get(`${token}:uan`);
  user['date-of-birth'] = await redis.get(`${token}:date-of-birth`);

  return user;
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
