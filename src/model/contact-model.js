'use strict';

const database = require('../database');
const Sequelize = database.Sequelize;

const core = require('../core');
const validator = core.validator;
const ContainerModel = core.ContainerModel;
const Model = core.Model;
const accountModel = require('./account-model');

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

class ContactModel extends ContainerModel {
  constructor() {
    super('contacts');
    this.buildModel(MODEL_ATTRIBUTES);
    this.createBelongsToManyAssociation('accounts', 'contact_accounts', 'contact_id', accountModel.sequelizeModel, ['id']);
  }

  get accounts() {
    return this.getAssociation("accounts");
  }

  loadAccountsByContactId(id, transaction) {
    return this.accounts.throughModel.findAll({where: {contact_id: id}, transaction: transaction}).then((accounts) => {
      return _.map(accounts, (account) => {
        return {id: account.account_id};
      });
    });
  }

  async setAccounts(contactId, accounts, transaction) {
    accounts = _.map(accounts, (account) => {
      return {contact_id: contactId, account_id: account.id};
    });
    await this.accounts.throughModel.destroy({where: {contact_id: contactId}, transaction: transaction});
    await this.accounts.throughModel.bulkCreate(accounts, {transaction: transaction});
  }
}

module.exports = new ContactModel();

