'use strict';

const database = require('../database');
const Sequelize = database.Sequelize;

const core = require('../core');
const Model = core.Model;

const MODEL_ATTRIBUTES = {
  key: {type: Sequelize.STRING, unique: true, allowNull: false},
  value: {type: Sequelize.TEXT}
};

class ConfigModel extends Model {

  constructor() {
    super('config');
    this.buildModel(MODEL_ATTRIBUTES);
  }

  findByKey(key, transaction) {
    return this.findOne({key: key}, transaction);
  }
}

module.exports = new ConfigModel();