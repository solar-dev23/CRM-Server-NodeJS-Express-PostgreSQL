'use strict';

const database = require('../database');
const Sequelize = database.Sequelize;

const core = require('../core');
const Model = core.Model;

const MODEL_ATTRIBUTES = {
  type: {type: Sequelize.STRING, unique: true, allowNull: false},
  title: {
    type: Sequelize.TEXT,
    allowNull: false,
    validate: {
      len: 1,
    }
  }
};

class PermissionModel extends Model {
  constructor() {
    super('permissions');
    this.buildModel(MODEL_ATTRIBUTES);
  }
}

module.exports = new PermissionModel();
