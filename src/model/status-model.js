'use strict';

const database = require('../database');
const Sequelize = database.Sequelize;

const core = require('../core');
const Model = core.Model;

const MODEL_ATTRIBUTES = {
	name: {type: Sequelize.STRING, allowNull: false, unique: true},
  order: {type: Sequelize.INTEGER, allowNull: false},
  is_active: {type: Sequelize.BOOLEAN, defaultValue: true},
  createdAt: {type: Sequelize.DATE, field: 'created_at'},
  updatedAt: {type: Sequelize.DATE, field: 'updated_at'}  
};

class StatusModel extends Model {
  constructor() {
    super('statuses');
    this.buildModel(MODEL_ATTRIBUTES);
  }
}

module.exports = new StatusModel();

