'use strict';

const database = require('../database');
const Sequelize = database.Sequelize;

const core = require('../core');
const Model = core.Model;

const MODEL_ATTRIBUTES = {
  companyName: {field: 'company_name', type: Sequelize.TEXT, allowNull: false, validate: {len: 1}},
  displayName: {field: 'display_name', type: Sequelize.TEXT, allowNull: false, validate: {len: 1}},
  account_type: {type: Sequelize.STRING},
  contacts_id: {type: Sequelize.UUID},
  social_networks_id: {type: Sequelize.UUID},
  address_id: {type: Sequelize.UUID},
  prefered_payment_method: {type: Sequelize.STRING},
  prefered_delivery_method: {type: Sequelize.STRING},
  terms: {type: Sequelize.STRING},
  number_of_employees: {type: Sequelize.STRING},
  annual_revenue: {type: Sequelize.STRING},
  lead_source: {type: Sequelize.STRING},
  lead_rating: {type: Sequelize.STRING},
  notes: {type: Sequelize.STRING},
  physical_address_id: {type: Sequelize.UUID},
  shipping_address_id: {type: Sequelize.UUID}
};

class AccountModel extends Model {
  constructor() {
    super('accounts');
    this.buildModel(MODEL_ATTRIBUTES);
  }
}

module.exports = new AccountModel();

