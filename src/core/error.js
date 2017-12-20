'use strict';

const constants = require('./constants');
const HTTP_CODE = constants.HTTP_CODE;

class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

class BadRequestError extends RequestError {
  constructor(message) {
    super(HTTP_CODE.BAD_REQUEST, message);
  }
}

class ValidationError extends BadRequestError {
  constructor(message) {
    super(message);
  }
}

module.exports = {
  ValidationError,
  BadRequestError
};
