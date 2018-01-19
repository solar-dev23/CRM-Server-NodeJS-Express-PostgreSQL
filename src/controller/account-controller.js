const model = require('../model');
const accountModel = model.accountModel;
const core = require('../core');
const controllerUtils = core.controllerUtils;
const HTTP_CODES = core.HTTP_CODE;
const _ = require('lodash');

const save = async function (account) {
  return await accountModel.save(account);
};


module.exports.loadAll = function (req, res, next) {
  accountModel
    .loadAll()
    .then(accounts => res.json(accounts))
    .catch(next);
};

module.exports.save = function (req, res, next) {
  let account = controllerUtils.extractObjectFromRequest(req);
  if (account) {
    account.contacts = !account.contacts ? [] : account.contacts;
    save(account)
      .then(account => res.status(HTTP_CODES.OK).send(account))
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send('Incorrect request');
  }
}

module.exports.remove = function (req, res, next) {
  let id = controllerUtils.extractIdFromRequest(req);
  if (id) {
    accountModel
      .removeById(id)
      .then(() => res.status(HTTP_CODES.OK).send())
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send('Incorrect request');
  }
};