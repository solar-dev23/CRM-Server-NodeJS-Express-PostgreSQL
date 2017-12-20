'use strict';

const _ = require('lodash');

const database = require('../database');
const Sequelize = database.Sequelize;

const core = require('../core');
const Model = core.Model;

const MODEL_ATTRIBUTES = {
  from: {type: Sequelize.STRING, allowNull: false},
  to: {type: Sequelize.TEXT, allowNull: false},
  subject: {type: Sequelize.TEXT},
  text: {type: Sequelize.TEXT},
  html: {type: Sequelize.TEXT}
};

class MailModel extends Model {
  constructor() {
    super('mail');
    super.buildModel(MODEL_ATTRIBUTES);
  }

  saveLetters(letters, transaction) {
    _.forEach(letters, (letter) => {
      letter.to = typeof letter.to !== "object" ? [letter.to] : letter.to;
      letter.to = JSON.stringify(letter.to);
    });
    return this.sequelizeModel.bulkCreate(letters, {transaction: transaction});
  }

  loadLetters(limit) {
    return this.sequelizeModel
      .findAll({order: '"created_at"', limit: limit})
      .then((letters) => {
        _.forEach(letters, letter => letter.to = JSON.parse(letter.to));
        return letters;
      });
  };
}

module.exports = new MailModel();