'use strict';

module.exports.extractObjectFromRequest = function (req) {
  return req.body ? req.body.object : null;
};

module.exports.extractIdFromRequest = function (req) {
  return req.body ? req.body.id : null;
};