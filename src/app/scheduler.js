'use strict';

const _ = require('lodash');
const schedule = require('node-schedule');
const env = require('../env');
const mail = require('../mail');

const model = require('../model');
const userModel = model.userModel;
const accessTokenModel = model.accessTokenModel;
const reminderModel = model.reminderModel;
const opportunityModel = model.opportunityModel;

const controller = require('../controller');
const userController = controller.userController;

const database = require('../database');
const sequelize = database.sequelize;


const USERS_HEAP_SIZE = 10;

let checkTrialPeriodTaskId = false;

const checkTrialPeriod = function () {
  if (checkTrialPeriodTaskId) {
    return;
  }
  checkTrialPeriodTaskId = setTimeout(() => {
    userModel.findExpiredUsers(USERS_HEAP_SIZE).then((users) => {
      if (users.length <= 0) {
        checkTrialPeriodTaskId = null;
        return;
      }
      let promises = [];
      _.forEach(users, user => {
        let promise = sequelize
          .transaction(async (transaction) => {
            await userModel.deactivateUser(user.id, transaction);
            await accessTokenModel.clearUserSession(user.id, transaction);
          })
          .then(() => mail.createAccountExpiredMessages([user]))
          .catch(error => console.error(error));

        promises.push(promise);
      });
      Promise.all(promises).then(() => {
        mail.sendMail();
        checkTrialPeriodTaskId = null;
        users.length === USERS_HEAP_SIZE && checkTrialPeriod();
      });
    });
  }, 0);
};

const checkReminderUsers = function() {
  var current = new Date();
  reminderModel.find({
    reminder_date: {
      $lte: new Date(current.getTime() + 10 * 60 * 1000),
      $gte: current
    }
  }).then(reminders => {
    reminders.forEach(function(reminder){
      userModel.findById(reminder.user_id).then(user => {
        opportunityModel.findById(reminder.opportunity_id).then(opportunity => {
          mail.sendReminderMessage(user, opportunity.name);
        }).catch(error => console.log(error));
      }).catch(error => console.log(error));
    })
  })
  .catch(error => console.log(error));
}

module.exports.start = function () {
  schedule.scheduleJob(`*/${env.SCHEDULER.TRIAL_PERIOD_CHECK_INTERVAL_IN_MINUTES} * * * *`, checkTrialPeriod);
  schedule.scheduleJob(`*/${env.SCHEDULER.REMINDER_USER_CHECK_INTERVAL_IN_MINUTES} * * * *`, checkReminderUsers);
};