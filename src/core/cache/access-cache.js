'use strict';

const _ = require('lodash');
const Cache = require('./cache');

class AccessCache {
  constructor() {
    this._rolesCache = new Cache();
    this._permissionsCache = new Cache();
  }

  cacheRole(role) {
    return this._rolesCache.cacheObject(role);
  }

  getRoleById(id) {
    return this._rolesCache.getByKey(id);
  }

  getRole(permissionTypes) {
    let res = null;
    _.forEach(this.getRoles(), (role) => {
      let permissions = this.getPermissionsByRoleId(role.id) || [];
      let hasPermissions = true;
      _.forEach(permissionTypes, (permissionType) => {
        hasPermissions = _.indexOf(permissions, permissionType) >= 0;
        return hasPermissions;
      });
      if(hasPermissions) {
        if(res) {
          let resPermissions = this.getPermissionsByRoleId(res.id) || [];
          res = permissions.length < resPermissions.length ? role : res;
        } else {
          res = role;
        }
      }
    });
    return res;
  }

  cacheRolePermissions(roleId, permissions) {
    return this._permissionsCache.cache(roleId, permissions);
  }

  getPermissionsByRoleId(roleId) {
    return this._permissionsCache.getByKey(roleId);
  }

  getRoles() {
    return this._rolesCache.getAllCachedObjects();
  }

  getPermissionsForRoles(roles) {
    let res = [];
    _.forEach(roles, role => res = _.concat(res, this.getPermissionsByRoleId(role.id)));
    return res;
  };

  getDefaultRole() {
    return _.find(this.getRoles(), {default: true});
  }
}

module.exports = new AccessCache();