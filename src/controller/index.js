'use strict';

const authController = require('./auth-controller');
const mainController = require('./main-controller');
const userController = require('./user-controller');
const accessController = require('./access-controller');
const dashboardController = require('./dashboard-controller');
const opportunityController = require('./opportunity-controller');
const statusController = require('./status-controller');
const reminderController = require('./reminder-controller');
const contactController = require('./contact-controller');
const accountController = require('./account-controller');
const addressController = require('./address-controller');
const roleController = require('./role-controller');
const socialNetworkController = require('./social-network-controller');

const init = function () {
  return accessController.init();
};

module.exports = {
  init,
  authController,
  mainController,
  userController,
  accessController,
  dashboardController,
  opportunityController,
  statusController,
  reminderController,
  contactController,
  accountController,
  addressController,
  roleController,
  socialNetworkController
};
