const model = require('../model');
const reminderModel = model.reminderModel;
const core = require('../core');
const controllerUtils = core.controllerUtils;
const HTTP_CODES = core.HTTP_CODE;
const _ = require('lodash');

const save = async function (reminder) {
  return await reminderModel.save(reminder);
};

module.exports.loadAll = function (req, res, next) {
  reminderModel
    .loadAll()
    .then(reminders => res.json(reminders))
    .catch(next);
};

module.exports.save = function (req, res, next) {
  let reminder = controllerUtils.extractObjectFromRequest(req);
  if (reminder) {
    save(reminder)
      .then(reminder => res.status(HTTP_CODES.OK).send(reminder))
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send({message: 'Incorrect request'});
  }
}

module.exports.remove = function (req, res, next) {
  let id = controllerUtils.extractIdFromRequest(req);
  if (id) {
    reminderModel
      .removeById(id)
      .then(() => res.status(HTTP_CODES.OK).send())
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send({message: 'Incorrect request'});
  }
};