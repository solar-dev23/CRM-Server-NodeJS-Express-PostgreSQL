'use strict';

const controller = require('../controller');
const authController = controller.authController;
const userController = controller.userController;
const accessController = controller.accessController;
const dashboardController = controller.dashboardController;
const opportunityController = controller.opportunityController;
const statusController = controller.statusController;
const reminderController = controller.reminderController;
const contactController = controller.contactController;
const accountController = controller.accountController;
const addressController = controller.addressController;
const roleController = controller.roleController;
const socialNetworkController = controller.socialNetworkController;
const departmentController = controller.departmentController;

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

  router.post('/rest/user/update', userController.update);
  router.post('/rest/user/avatar', userController.upload);

  router.post('/rest/dashboard/calculate', dashboardController.calculate);
  router.post('/rest/dashboard/calculate/v2', dashboardController.calculateV2);

  router.get('/rest/opportunity/all', opportunityController.loadAll);
  router.post('/rest/opportunity/save', opportunityController.save);
  router.delete('/rest/opportunity/remove', opportunityController.remove);
  router.post('/rest/opportunity/reorder', opportunityController.reorder);
  router.post('/rest/opportunity/archiveAll', opportunityController.archiveAll);

  router.get('/rest/status/all', statusController.loadAll);
  router.post('/rest/status/save', statusController.save);
  router.delete('/rest/status/remove', statusController.remove);
  router.post('/rest/status/reorder', statusController.reorder);

  router.get('/rest/reminder/all', reminderController.loadAll);
  router.post('/rest/reminder/save', reminderController.save);
  router.delete('/rest/reminder/remove', reminderController.remove);

  router.get('/rest/contact/all', contactController.loadAll);
  router.post('/rest/contact/save', contactController.save);
  router.delete('/rest/contact/remove', contactController.remove);

  router.get('/rest/account/all', accountController.loadAll);
  router.post('/rest/account/save', accountController.save);
  router.delete('/rest/account/remove', accountController.remove);
  router.post('/rest/account/upload', accountController.upload);

  router.get('/rest/address/all', addressController.loadAll);
  router.post('/rest/address/save', addressController.save);
  router.delete('/rest/address/remove', addressController.remove);
  router.get('/rest/address/:id', addressController.getById);

  router.get('/rest/role/all', roleController.loadAll);
  router.post('/rest/role/save', roleController.save);
  router.delete('/rest/role/remove', roleController.remove);

  router.get('/rest/socialNetwork/all', socialNetworkController.loadAll);
  router.post('/rest/socialNetwork/save', socialNetworkController.save);
  router.delete('/rest/socialNetwork/remove', socialNetworkController.remove);
  router.get('/rest/socialNetwork/:id', socialNetworkController.getById);

  router.get('/rest/department/all', departmentController.loadAll);
  router.post('/rest/department/save', departmentController.save);
  router.delete('/rest/department/remove', departmentController.remove);
  router.get('/rest/department/:id', departmentController.getById);
};
