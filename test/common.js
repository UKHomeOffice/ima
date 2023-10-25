'use strict';
require('dotenv').config();

process.env.NODE_ENV = 'test';

global.reqres = require('hof').utils.reqres;
global.chai = require('chai')
  .use(require('sinon-chai'));
global.should = chai.should();
global.expect = chai.expect;
global.sinon = require('sinon');
global.proxyquire = require('proxyquire');
global.path = require('path');
global.config = require('../config');
global._ = require('lodash');

process.setMaxListeners(0);
process.stdout.setMaxListeners(0);
