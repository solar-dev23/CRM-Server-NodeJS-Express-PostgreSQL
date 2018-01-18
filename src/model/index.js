'use strict';

const _ = require('lodash');
const accessTokenModel = require('./access-token-model');
const userModel = require('./user-model');
const configModel = require('./config-model');
const mailModel = require('./mail-model');
const confirmationKeyModel = require('./confirmation-key-model');
const permissionModel = require('./permission-model');
const roleModel = require('./role-model');
const departmentModel = require('./department-model');
const opportunityModel = require('./opportunity-model');
const statusModel = require('./status-model');
const reminderModel = require('./reminder-model');
const contactModel = require('./contact-model');
const accountModel = require('./account-model');
const socialNetworkModel = require('./social-network-model');
const contactAccountsModel = require('./contact-accounts-model');

const database = require('../database');
const sequelize = database.sequelize;

const core = require('../core');
const Model = core.Model;

const init = function () {
  let promises = [];
  _.forEach(module.exports, (moduleMember) => {
    if (moduleMember instanceof Model) {
      let res = moduleMember.init();
      res instanceof Promise && promises.push(res);
    }
  });
  return Promise.all(promises).then(() => sequelize.sync({force: false}));
};

module.exports = {
  init,
  configModel,
  accessTokenModel,
  userModel,
  mailModel,
  confirmationKeyModel,
  permissionModel,
  roleModel,
  departmentModel,
  opportunityModel,
  statusModel,
  reminderModel,
  contactModel,
  accountModel,
  socialNetworkModel,
  contactAccountsModel
};