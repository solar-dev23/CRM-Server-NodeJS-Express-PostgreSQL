'use strict';

module.exports.extractObjectFromRequest = function (req) {
  return req.body ? req.body.object : null;
};

module.exports.extractIdFromRequest = function (req) {
  return req.body ? req.body.id : null;
};

module.exports.responseHandler = function (res, success, message, data) {
  res.json({
      success: success,
      message: message,
      data: data
  });
};

module.exports.formatDate = function (date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}