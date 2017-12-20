'use strict';

const Sequelize = require('sequelize');
const env = require('./env');

module.exports.sequelize = new Sequelize(env.DATA_SOURCE_URL, { logging: env.NODE_ENV === env.ENV_TYPE.development});
module.exports.Sequelize = Sequelize;