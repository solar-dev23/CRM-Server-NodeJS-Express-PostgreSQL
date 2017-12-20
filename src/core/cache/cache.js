'use strict';

const _ = require('lodash');
const dalUtils = require('../dal/dal-utils');

class Cache {
  constructor(keyGenerator) {
    this._objectByKey = {};
    if(keyGenerator) {
      this.getObjectKey = keyGenerator;
    }
  }

  cache(key, object) {
    if (key) {
      object = dalUtils.getSequelizeInstanceValues(object);
      this._objectByKey[key] = object;
      return object;
    } else {
      return null;
    }
  }

  isObjectCached(object) {
    let key = this.getObjectKey(object);
    return key && !!this.getByKey(key);
  }

  cacheObject(object) {
    let key = this.getObjectKey(object);
    return key ? this.cache(key, object) : null;
  }

  getByKey(key) {
    return this._objectByKey[key];
  }

  clearByKey(key) {
    delete this._objectByKey[key];
  }

  removeFromCache(object) {
    let key = this.getObjectKey(object);
    object && this.clearByKey(key);
  }

  getAllCachedObjects() {
    return _.values(this._objectByKey);
  }

  getFilteredObjects(filter) {
    return _.filter(this._objectByKey, filter);
  }

  getObjectKey(object) {
    return object.id;
  }
}

module.exports = Cache;