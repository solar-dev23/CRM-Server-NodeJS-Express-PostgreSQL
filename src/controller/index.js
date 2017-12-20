'use strict';

const authController = require('./auth-controller');
const mainController = require('./main-controller');
const userController = require('./user-controller');
const accessController = require('./access-controller');

const init = function () {
  return accessController.init();
};

module.exports = {
  init,
  authController,
  mainController,
  userController,
  accessController
};

