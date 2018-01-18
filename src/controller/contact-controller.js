const model = require('../model');
const contactModel = model.contactModel;
const core = require('../core');
const controllerUtils = core.controllerUtils;
const HTTP_CODES = core.HTTP_CODE;
const _ = require('lodash');

const database = require('../database');
const sequelize = database.sequelize;

const save = async function (contact) {
  return await contactModel.save(contact);
};


module.exports.loadAll = function (req, res, next) {
  contactModel
    .loadAll()
    .then(contacts => res.json(contacts))
    .catch(next);
};

module.exports.save = function (req, res, next) {
  let contact = controllerUtils.extractObjectFromRequest(req); 
  if (contact) {
    contact.accounts = !contact.accounts ? [] : contact.accounts;
    save(contact)
      .then(contact => res.status(HTTP_CODES.OK).send(contact))
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send('Incorrect request');
  }
}

module.exports.remove = function (req, res, next) {
  let id = controllerUtils.extractIdFromRequest(req);
  if (id) {
    contactModel
      .removeById(id)
      .then(() => res.status(HTTP_CODES.OK).send())
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send('Incorrect request');
  }
};