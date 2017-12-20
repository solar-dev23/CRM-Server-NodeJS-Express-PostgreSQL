'use strict';

const _ = require('lodash');

const model = require('../model');
const roleModel = model.roleModel;
const permissionModel = model.permissionModel;
const userModel = model.userModel;
const accessTokenModel = model.accessTokenModel;

const core = require('../core');
const controllerUtils = core.controllerUtils;
const constants = core.constants;
const accessCache = core.accessCache;

let defaultRole = null;

const getAuthData = function (req) {
  return req.user;
};

const hasPermissions = function (authData, permissions) {
  permissions = typeof permissions === "string" ? [permissions] : permissions;
  let userPermissions = authData.permissions;
  let hasPermission = false;
  _.forEach(userPermissions, (permission) => {
    hasPermission = _.indexOf(permissions, permission) >= 0;
    return !hasPermission;
  });
  return hasPermission;
};

const sendInsufficientRightsError = function (res) {
  res.status(403).send('Insufficient rights to perform the operation');
};

module.exports.init = function () {
  return permissionModel
    .loadAll()
    .then(permissions => {
      let permissionTypeById = {};
      _.forEach(permissions, permission => {
        permissionTypeById[permission.id] = permission.type;
      });
      return roleModel
        .loadAll()
        .then((roles) => {
          _.forEach(roles, (role) => {
            let permissions = [];
            _.forEach(role.permissions, permission => permissions.push(permissionTypeById[permission.id]));
            accessCache.cacheRolePermissions(role.id, permissions);
            role = accessCache.cacheRole(role);
            defaultRole = role.default ? role : defaultRole;
          });
        });
    });
};

module.exports.getAuthData = getAuthData;

module.exports.checkPermissions = function (permissions) {
  return (req, res, next) => {
    !hasPermissions(getAuthData(req), permissions) ? sendInsufficientRightsError(res) : next();
  }
};

module.exports.hasPermissions = hasPermissions;

module.exports.getPermissionsForRoles = function (roles) {
  return accessCache.getPermissionsForRoles(roles);
};