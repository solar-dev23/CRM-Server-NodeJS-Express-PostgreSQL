'use strict';

const database = require('../database');
const Sequelize = database.Sequelize;

const core = require('../core');
// const Model = core.Model;
const ContainerModel = core.ContainerModel;
const contactModel = require('./contact-model');
const accountModel = require('./account-model');

const MODEL_ATTRIBUTES = {
  contact_id: {type: Sequelize.UUID, allowNull: false},
  account_id: {type: Sequelize.UUID, allowNull: false}
};

class ContactAccountsModel extends ContainerModel {
  constructor() {
    super('CA');
    this.buildModel(MODEL_ATTRIBUTES);
    accountModel.createBelongsToManyAssociationWithCircular('contacts', 'contact_accounts', 'account_id', contactModel.sequelizeModel, ['id']);
    contactModel.createBelongsToManyAssociation('accounts', 'contact_accounts', 'contact_id', accountModel.sequelizeModel, ['id']);
  }
}

module.exports = new ContactAccountsModel();

