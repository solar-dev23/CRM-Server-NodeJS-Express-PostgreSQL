'use strict';

const database = require('../database');
const Sequelize = database.Sequelize;

const core = require('../core');
const Model = core.Model;

const MODEL_ATTRIBUTES = {
  user_id: {type: Sequelize.BIGINT},
  opportunity_id: {type: Sequelize.BIGINT},
  reminder_id: {type: Sequelize.STRING(50)},
  reminder_date: {type: Sequelize.DATE}
};

class ReminderModel extends Model {
  constructor() {
    super('reminders');
    this.buildModel(MODEL_ATTRIBUTES);
  }
}

module.exports = new ReminderModel();