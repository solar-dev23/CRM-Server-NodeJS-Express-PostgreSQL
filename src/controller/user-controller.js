'use strict';

const _ = require('lodash');
const moment = require('moment');
const mail = require('../mail');
const env = require('../env');
const accessController = require('./access-controller');

const model = require('../model');
const userModel = model.userModel;
const accessTokenModel = model.accessTokenModel;
const confirmationKeyModel = model.confirmationKeyModel;

const database = require('../database');
const sequelize = database.sequelize;

const core = require('../core');
const controllerUtils = core.controllerUtils;
const accessCache = core.accessCache;
const HTTP_CODES = core.HTTP_CODE;
const PERMISSION_TYPE = core.constants.PERMISSION_TYPE;
const BadRequestError = core.error.BadRequestError;

const getDefaultRoles = function () {
  let defaultRole = accessCache.getDefaultRole();
  return defaultRole ? [defaultRole] : [];
};

const throwSuperAdministratorCredentialsLostError = function () {
  throw new BadRequestError('Super administrator credentials will be lost');
};

const save = async function (user, authData) {
  let permissions = accessCache.getPermissionsForRoles(user.roles);
  let isSuperAdministrator = _.indexOf(permissions, PERMISSION_TYPE.administration) >= 0;
  if (isSuperAdministrator) {
    user.active = true;
    user.expires = null;
    if (authData.id !== user.id) {
      return await sequelize.transaction(async (transaction) => {
        let removeActivationKey = !!user.id;
        user = await userModel.save(user, transaction);
        await userModel.setRoles(authData.id, getDefaultRoles(), transaction);
        await accessTokenModel.clearUserSession([authData.id], transaction);
        removeActivationKey && await confirmationKeyModel.removeAccountActivationKey(user.id, transaction);
        return user;
      });
    }
  } else if (authData.id === user.id) {
    throwSuperAdministratorCredentialsLostError();
  }
  return await userModel.save(user);
};

module.exports.loadAll = function (req, res, next) {
  userModel
    .loadAll()
    .then(users => res.json(users))
    .catch(next);
};

module.exports.save = function (req, res, next) {
  let user = controllerUtils.extractObjectFromRequest(req);
  if (user) {
    user.roles = !user.roles ? getDefaultRoles() : user.roles;
    save(user, accessController.getAuthData(req))
      .then(user => res.status(HTTP_CODES.OK).send(user))
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send('Incorrect request');
  }
};

module.exports.remove = function (req, res, next) {
  let id = controllerUtils.extractIdFromRequest(req);
  if (id) {
    let authData = accessController.getAuthData(req);
    authData.id === id && throwSuperAdministratorCredentialsLostError();
    userModel
      .removeById(id)
      .then(() => res.status(HTTP_CODES.OK).send())
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send('Incorrect request');
  }
};

const activateUser = async function (userId, password, expires, transaction) {
  if (!transaction) {
    return sequelize.transaction(transaction => activateUser(userId, password, expires, transaction));
  }
  await userModel.activateUser(userId, password, expires, transaction);
};

const deactivateUser = async function (userId, transaction) {
  if (!transaction) {
    return sequelize.transaction(transaction => deactivateUser(userId, transaction));
  }
  await userModel.deactivateUser(userId, transaction);
  await accessTokenModel.clearUserSession(userId, transaction);
};

module.exports.register = function (req, res, next) {
  let user = controllerUtils.extractObjectFromRequest(req);
  if (user && !user.id) {
    user.active = false;
    user.roles = getDefaultRoles();
    userModel
      .save(user)
      .then(user => confirmationKeyModel.createAccountActivationKey(user.id))
      .then((key) => {
        mail.sendActivationMessage(user, key);
        res.json({supportEmail: env.POST_ADDRESS});
      })
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send('Incorrect request');
  }
};

module.exports.confirmResetPassword = function (req, res, next) {
  let user = req.body;
  if (user && user.email) {
    userModel
      .findByUsernameOrEmail(user.email)
      .then((user) => {
        if (user) {
          confirmationKeyModel
            .createResetPasswordKey(user.id)
            .then((key) => {
              mail.sendResetPasswordMessage(user, key);
              res.json({supportEmail: env.POST_ADDRESS});
            })
            .catch(next);
        } else {
          res.status(HTTP_CODES.BAD_REQUEST).send("User not found");
        }
      })
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send('Incorrect request');
  }
};


module.exports.activateAccount = function (req, res, next) {
  let activationKey = req.body.key, password = req.body.password;
  if (activationKey && password) {
    confirmationKeyModel
      .findAccountActivationKeyByValue(activationKey)
      .then((key) => {
        if (key) {
          return sequelize
            .transaction((transaction) => {
              let expires;
              if (env.TRIAL_PERIOD_INTERVAL_IN_MS) {
                expires = moment().add(env.TRIAL_PERIOD_INTERVAL_IN_MS, 'milliseconds');
              }
              return activateUser(key.userId, password, expires.toDate(), transaction)
                .then(() => confirmationKeyModel.removeById(key.id, transaction))
                .then(() => userModel.findById(key.userId));
            })
            .then((user) => {
              user ? res.json({username: user.username || user.email}) : res.status(401).send('User no longer exist');
            })
            .catch(next);
        } else {
          res.status(HTTP_CODES.UNAUTHORIZED).send('Invalid activation key');
        }
      })
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send('Incorrect request');
  }
};

module.exports.resetPassword = function (req, res, next) {
  let activationKey = req.body.key, password = req.body.password;
  if (activationKey && password) {
    confirmationKeyModel
      .findAccountActivationKeyByValue(activationKey)
      .then((key) => {
        if (key) {
          return sequelize
            .transaction((transaction) => {
              return userModel
                .resetPassword(key.userId, password, transaction)
                .then(() => confirmationKeyModel.removeById(key.id, transaction))
                .then(() => userModel.findById(key.userId));
            })
            .then((user) => {
              if (user) {
                user.active ? res.json({username: user.username || user.email}) :
                  res.status(HTTP_CODES.FORBIDDEN).send('User is not active, possible your trial period has expired');
              } else {
                res.status(HTTP_CODES.UNAUTHORIZED).send('User no longer exist');
              }
            })
            .catch(next);
        } else {
          res.status(HTTP_CODES.UNAUTHORIZED).send('Invalid activation key');
        }
      })
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send('Incorrect request');
  }
};

module.exports.checkAlreadyExist = function (req, res, next) {
  let usernameOrEmail = req.body ? req.body.value : '';
  let id = req.body ? req.body.objectId : '';
  if (usernameOrEmail) {
    userModel
      .findByUsernameOrEmail(usernameOrEmail)
      .then(user => res.status(HTTP_CODES.OK).json({unique: !user || user.id === id}))
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send('Incorrect request');
  }
};

module.exports.getOne = function(req, res, next) {
  return userModel
    .findById(req.query.id)
    .then(user => {
        if (!user) {
          return res.status(400).send({
            message: 'User Not Found',
          });
        }

        return res.status(200).send(user)
    })
    .catch(error => res.status(400).send(error));
};

module.exports.update = function(req, res, next) {
  return userModel
    .findById(req.body.object.id)
    .then(user => {
        if (!user) {
          return res.status(404).send({
            message: 'User Not Found',
          });
        }

        return user
          .update(req.body.object)
          .then(() => res.status(200).send(user))
          .catch(error => res.status(400).send(error));
    })
    .catch(error => res.status(400).send(error));
};