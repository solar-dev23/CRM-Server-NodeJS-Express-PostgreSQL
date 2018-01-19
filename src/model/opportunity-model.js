'use strict';

const database = require('../database');
const Sequelize = database.Sequelize;

const core = require('../core');
const Model = core.Model;

const MODEL_ATTRIBUTES = {
  status_id: {type: Sequelize.UUID, allowNull: false, unique: true},
  name: {type: Sequelize.STRING, allowNull: false},
  company_id: {type: Sequelize.STRING},
  contact_id: {type: Sequelize.STRING},
  value: {type: Sequelize.FLOAT},
  currency:  {type: Sequelize.STRING},
  rating: {type: Sequelize.INTEGER, defaultValue: 3},
  description: {type: Sequelize.TEXT},
  bgColor: {type: Sequelize.STRING, defaultValue: 'white'},
  order: {type: Sequelize.INTEGER, allowNull: false},
  is_active: {type: Sequelize.BOOLEAN, defaultValue: true},
  user_id: {type: Sequelize.UUID},
  notify_users: {type: Sequelize.TEXT},
  createdAt: {type: Sequelize.DATE, field: 'created_at'},
  updatedAt: {type: Sequelize.DATE, field: 'updated_at'}
};

class OpportunityModel extends Model {
  constructor() {
    super('opportunities');
    this.buildModel(MODEL_ATTRIBUTES);
  }
}

module.exports = new OpportunityModel();