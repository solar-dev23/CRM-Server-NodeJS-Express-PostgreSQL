'use strict';

const passwordGenerator = require('generate-password');
const userModel = require('./user-model');

const database = require('../database');
const sequelize = database.sequelize;
const Sequelize = database.Sequelize;

const core = require('../core');
const constants = core.constants;
const Model = core.Model;

const MODEL_ATTRIBUTES = {
  value: {type: Sequelize.STRING, unique: true, allowNull: false},
  type: {type: Sequelize.STRING, allowNull: false},
  userId: {
    type: Sequelize.UUID,
    field: 'user_id',
    onDelete: 'cascade',
    references: {
      model: userModel.sequelizeModel,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
    }
  }
};

const MODEL_OPTIONS = {
  indexes: [{unique: true, fields: ['type', 'user_id']}]
};

class ConfirmationKeyModel extends Model {
  constructor() {
    super('confirmation_keys');
    this.buildModel(MODEL_ATTRIBUTES, MODEL_OPTIONS);
  }

  removeByUserIdAndType(userId, type, transaction) {
    return this.remove({userId: userId, type: type}, transaction);
  }

  _createConfirmationKey(userId, type, transaction) {
    if (!transaction) {
      return sequelize.transaction(transaction => this._createConfirmationKey(userId, type, transaction));
    }
    return this.removeByUserIdAndType(userId, type, transaction).then(() => {
      let value = passwordGenerator.generate({length: 120, numbers: true});
      return this.save({value: value, userId: userId, type: type}, transaction);
    });
  }

  createAccountActivationKey(userId, transaction) {
    return this._createConfirmationKey(userId, constants.CONFIRMATION_TYPE.account_activation, transaction);
  }

  removeAccountActivationKey(userId, transaction) {
    return this.removeByUserIdAndType(userId, constants.CONFIRMATION_TYPE.account_activation, transaction);
  }

  createResetPasswordKey(userId, transaction) {
    return this._createConfirmationKey(userId, constants.CONFIRMATION_TYPE.reset_password, transaction);
  }

  findAccountActivationKeyByValue (value, transaction) {
    return this.findOne({value: value}, transaction);
  };
}

module.exports = new ConfirmationKeyModel();