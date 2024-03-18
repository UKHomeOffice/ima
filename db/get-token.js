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
  user.cepr = await redis.get(`${token}:cepr`);
  user['date-of-birth'] = await redis.get(`${token}:date-of-birth`);
  user['duty-to-remove-alert'] = await redis.get(`${token}:duty-to-remove-alert`);

  console.log("USER: " + JSON.stringify(user));

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
