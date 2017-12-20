'use strict';

const env = require('../../env');

const model = require('../../model');
const userModel = model.userModel;

const core = require('../../core');
const accessCache = core.accessCache;
const constants = core.constants;

module.exports.init = function (transaction) {
  let superAdministratorRole = accessCache.getRole([constants.PERMISSION_TYPE.administration]);
  return userModel.save({
    username: env.DEFAULT_ADMINISTRATOR_NAME,
    firstName: "Eric",
    lastName: "Smith",
    active: true,
    password: env.DEFAULT_ADMINISTRATOR_PASSWORD,
    roles: [superAdministratorRole]
  }, transaction);
};
