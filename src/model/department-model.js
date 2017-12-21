'use strict';

const database = require('../database');
const Sequelize = database.Sequelize;

const core = require('../core');
const Model = core.Model;

const MODEL_ATTRIBUTES = {
  type: {type: Sequelize.STRING, unique: true, allowNull: false}
};

class DepartmentModel extends Model {
  constructor() {
    super('departments');
    this.buildModel(MODEL_ATTRIBUTES);
  }
}

module.exports = new DepartmentModel();
