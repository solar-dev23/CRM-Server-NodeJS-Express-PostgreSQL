'use strict';

const _ = require('lodash');
const messageFactory = require('./message-factory');
const mailer = require('./mailer');
const env = require('../env');

const model = require('../model');
const mailModel = model.mailModel;


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

module.exports.sendMail = function () {
  mailer.sendMail();
};
