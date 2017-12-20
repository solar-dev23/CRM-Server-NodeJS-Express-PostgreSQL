'use strict';

const pug = require('pug');
const env = require('../env');

const model = require('../model');
const userModel = model.userModel;

const compileTemplate = function (name) {
  return pug.compileFile(`${__dirname}/templates/${name}.html`);
};

const activationMessageTemplate = compileTemplate('account-activation');
const accountExpiredMessageTemplate = compileTemplate('trial-period-expired');
const resetPasswordMessageTemplate = compileTemplate('reset-password-template');

module.exports.buildActivationMessage = function (user, key) {
  return activationMessageTemplate({
    recipientTitle: userModel.getDisplayName(user),
    company: env.POST_SENDER_TITLE,
    frontendUrl: env.FRONTEND_URL,
    activationKey: key.value
  });
};

module.exports.buildResetPasswordMessage = function (user, key) {
  return resetPasswordMessageTemplate({
    recipientTitle: userModel.getDisplayName(user),
    username: user.email,
    company: env.POST_SENDER_TITLE,
    frontendUrl: env.FRONTEND_URL,
    activationKey: key.value
  });
};

module.exports.buildAccountExpiredMessage = function (user) {
  return accountExpiredMessageTemplate({
    recipientTitle: userModel.getDisplayName(user),
    company: env.POST_SENDER_TITLE,
    frontendUrl: env.FRONTEND_URL
  });
};
