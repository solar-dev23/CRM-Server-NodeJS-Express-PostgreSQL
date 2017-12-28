'use strict';

const database = require('../database');
const Sequelize = database.Sequelize;

const core = require('../core');
const Model = core.Model;

const MODEL_ATTRIBUTES = {
	name: {type: Sequelize.STRING, allowNull: false, unique: true},
  order: {type: Sequelize.INTEGER, allowNull: false},
  is_active: {type: Sequelize.BOOLEAN, defaultValue: true}
};

class StatusModel extends Model {
  constructor() {
    super('statuses');
    this.buildModel(MODEL_ATTRIBUTES);
  }
}

module.exports = new StatusModel();

