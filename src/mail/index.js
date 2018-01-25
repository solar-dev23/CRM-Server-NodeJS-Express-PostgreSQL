'use strict';

const _ = require('lodash');
const messageFactory = require('./message-factory');
const mailer = require('./mailer');
const env = require('../env');

const model = require('../model');
const mailModel = model.mailModel;
const userModel = model.userModel;

const createLetterObject = function (recipients, subject, textBody, htmlBody) {
  return {
    from: `"${env.POST_SENDER_TITLE}" <${env.POST_ADDRESS}>`,
    to: recipients,
    subject: subject,
    text: textBody,
    html: htmlBody
  }
};

const sendMessage = function (recipients, subject, textBody, htmlBody) {
  return mailModel
    .saveLetters([createLetterObject(recipients, subject, textBody, htmlBody)])
    .then(() => mailer.sendMail());
};

module.exports.sendActivationMessage = function (user, key) {
  if (user.email) {
    sendMessage([user.email], 'Account activation', null, messageFactory.buildActivationMessage(user, key));
  }
};

module.exports.sendResetPasswordMessage = function (user, key) {
  if (user.email) {
    sendMessage([user.email], 'Password Reset', null, messageFactory.buildResetPasswordMessage(user, key));
  }
};

module.exports.createAccountExpiredMessages = function (users, transaction) {
  let messages = [];
  _.forEach(users, (user => {
    if (user.email) {
      let message = createLetterObject([user.email], 'Trial period has expired',
        null, messageFactory.buildAccountExpiredMessage(user));
      messages.push(message);
    }
  }));
  return mailModel.saveLetters(messages, transaction);
};

module.exports.sendNotifyMessages = function (users, opportunityName) {
   userModel
    .find({id: { $in: users }})
    .then(users => {
      _.forEach(users, (user => {
        if(user.dataValues.email !== '') {
          sendMessage([user.dataValues.email], 'Notify Email', null, '<span>The "'+opportunityName+'" opportunity has been updated.</span>');
        }
      }))
    }).catch(error => console.log(error));
};

module.exports.sendReminderMessage = function (user, opportunityName) {
  if (user.email) {
    sendMessage([user.email], 'Reminder Email', null, '<span>Reminder for the "'+opportunityName+'" opportunity.</span>');
  }
};

module.exports.sendMail = function () {
  mailer.sendMail();
};
