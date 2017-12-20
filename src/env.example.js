'use strict';

const moment = require('moment');

const ENV_TYPE = {
  development: "development",
  production: "production"
};

module.exports = {
  ENV_TYPE: ENV_TYPE,
  NODE_ENV: process.env.NODE_ENV || ENV_TYPE.development,
  PORT: process.env.PORT || 8087,
  HTTPS_DISABLED: !!process.env.HTTPS_DISABLED,
  PRIVATE_KEY: process.env.PRIVATE_KEY || '../key.pem',
  PUBLIC_KEY: process.env.PUBLIC_KEY || '../server.crt',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://localhost:4200',
  DATA_SOURCE_URL: process.env.DATABASE_URL || 'postgres://postgres:qq32167q[]@localhost:5432/boilerplate',
  POST_ADDRESS: process.env.POST_ADDRESS || 'EMAIL',
  POST_SERVICE: process.env.POST_SERVICE || 'gmail',
  POST_PASSWORD: process.env.POST_PASSWORD || 'PASSWORD',
  POST_SENDER_TITLE: process.env.POST_SENDER_TITLE || 'PRO FORWARD',
  DEFAULT_ADMINISTRATOR_NAME: 'admin',
  DEFAULT_ADMINISTRATOR_PASSWORD: 'Zaqwsx321',
  SCHEDULER: {
    TRIAL_PERIOD_CHECK_INTERVAL_IN_MINUTES: process.env.TRIAL_PERIOD_CHECK_INTERVAL_IN_MINUTES || '10'
  }
};

module.exports.TRIAL_PERIOD_INTERVAL_IN_MS = process.env.TRIAL_PERIOD_INTERVAL_IN_MS || moment.duration({
  seconds: 0,
  minutes: 0,
  hours: 0,
  days: 0,
  weeks: 0,
  months: 1,
  years: 0
}).asMilliseconds();