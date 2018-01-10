const model = require('../model');
const accountModel = model.accountModel;
const core = require('../core');
const controllerUtils = core.controllerUtils;
const HTTP_CODES = core.HTTP_CODE;
const _ = require('lodash');

module.exports.loadAll = function (req, res, next) {
  accountModel
    .loadAll()
    .then(accounts => res.json(accounts))
    .catch(next);
};

module.exports.save = function (req, res, next) {
	if(req.body.id){  // Update Account
    return accountModel
      .findById(req.body.id)
      .then(account => {
          if (!account) {
            return res.status(404).send({
              message: 'Account Not Found',
            });
          }

          return account
            .update(req.body)
            .then(() => res.status(200).send(account))
            .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  }else {           // Create Account
    return accountModel
      .save(req.body)
      .then(account => res.status(201).send(account))
      .catch(error => res.status(400).send(error));
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