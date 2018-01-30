'use strict';

const database = require('../database');
const Sequelize = database.Sequelize;

const core = require('../core');
const Model = core.Model;

const MODEL_ATTRIBUTES = {
  street1: {type: Sequelize.TEXT},
  street2: {type: Sequelize.TEXT},
  city: {type: Sequelize.TEXT},
  state: {type: Sequelize.TEXT},
  country: {type: Sequelize.TEXT},
  zip: {type: Sequelize.TEXT},
  zip2: {type: Sequelize.TEXT},
  notes: {type: Sequelize.TEXT},
  attn: {type: Sequelize.TEXT},
  phone_no: {type: Sequelize.TEXT}
};

class AddressModel extends Model {
  constructor() {
    super('addresses');
    this.buildModel(MODEL_ATTRIBUTES);
  }
}

module.exports = new AddressModel();

