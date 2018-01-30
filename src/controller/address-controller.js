const model = require('../model');
const addressModel = model.addressModel;
const core = require('../core');
const controllerUtils = core.controllerUtils;
const HTTP_CODES = core.HTTP_CODE;
const _ = require('lodash');

const save = async function (address) {
  return await addressModel.save(address);
};

module.exports.loadAll = function (req, res, next) {
  addressModel
    .loadAll()
    .then(addresses => res.json(addresses))
    .catch(next);
};

module.exports.save = function (req, res, next) {
  let address = controllerUtils.extractObjectFromRequest(req);
  if (address) {
    save(address)
      .then(address => res.status(HTTP_CODES.OK).send(address))
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send({message: 'Incorrect request'});
  }
}

module.exports.remove = function (req, res, next) {
  let id = controllerUtils.extractIdFromRequest(req);
  if (id) {
    addressModel
      .removeById(id)
      .then(() => res.status(HTTP_CODES.OK).send())
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send({message: 'Incorrect request'});
  }
};

module.exports.getById = function (req, res, next) {
  let id = req.params.id;
  if (id) {
    addressModel
      .findById(id)
      .then(address => res.status(HTTP_CODES.OK).send(address))
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send({message: 'Incorrect request'});
  }
};