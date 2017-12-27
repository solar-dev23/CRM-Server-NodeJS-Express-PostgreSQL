'use strict';

const controller = require('../controller');
const authController = controller.authController;
const userController = controller.userController;
const accessController = controller.accessController;
const dashboardController = controller.dashboardController;

const core = require('../core');
const constants = core.constants;


module.exports = function (router) {
  router.post('/login', authController.authenticate, authController.serialize,
    authController.generateToken, authController.sendAuthData);
  router.post('/logout', authController.checkAccessToken, authController.checkAccessTokenValid, authController.logout);
  router.post('/user/already-exist', userController.checkAlreadyExist);
  router.post('/user/register', userController.register);
  router.post('/user/activate-account', userController.activateAccount, authController.authenticate,
    authController.serialize, authController.generateToken, authController.sendAuthData);
  router.post('/user/confirm-reset-password', userController.confirmResetPassword);
  router.post('/user/reset-password', userController.resetPassword);


  // Use this route for rest queries of authenticated users
  router.post('/rest/*', authController.checkAccessToken, authController.checkAccessTokenValid);

  router.all('/rest/administration/*', accessController.checkPermissions(constants.PERMISSION_TYPE.administration));

  router.post('/rest/administration/user/all', userController.loadAll);
  router.post('/rest/administration/user/save', userController.save);
  router.post('/rest/administration/user/remove', userController.remove);

  router.get('/rest/user/one', userController.getOne);
  router.put('/rest/user', userController.update);

  router.post('/rest/dashboard/calculate', dashboardController.calculate);
  router.post('/rest/dashboard/calculate/v2', dashboardController.calculateV2);
};
