'use strict';

const database = require('../database');
const Sequelize = database.Sequelize;

const core = require('../core');
const validator = core.validator;
const Model = core.Model;

const MODEL_ATTRIBUTES = {
	firstName: {field: 'first_name', type: Sequelize.TEXT, allowNull: false, validate: {len: 1}},
	lastName:  {field: 'last_name', type: Sequelize.TEXT, allowNull: false, validate: {len: 1}},
	displayName: {field: 'display_name', type: Sequelize.TEXT},
  jobTitle: {field: 'job_title', type: Sequelize.TEXT},
  email: {
    type: Sequelize.TEXT,
    validate: {
      validateEmail(value) {
        validator.checkEmail(value);
      }
    }
  },
  phone: {
    type: Sequelize.STRING,
    validate: {
      validatePhoneNumber(value) {
        validator.checkPhoneNumber(value);
      }
    }
  },
  extension: {type: Sequelize.STRING},
  fax: {type: Sequelize.STRING},
  mobile: {type: Sequelize.STRING},
  account_id: {type: Sequelize.UUID},
  social_networks_id: {type: Sequelize.UUID},
  address_id: {type: Sequelize.UUID}
};

class ContactModel extends Model {
  constructor() {
    super('contacts');
    this.buildModel(MODEL_ATTRIBUTES);
  }
}

module.exports = new ContactModel();

