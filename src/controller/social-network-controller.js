const model = require('../model');
const socialNetworkModel = model.socialNetworkModel;
const core = require('../core');
const controllerUtils = core.controllerUtils;
const HTTP_CODES = core.HTTP_CODE;
const _ = require('lodash');

const save = async function (socialNetwork) {
  return await socialNetworkModel.save(socialNetwork);
};

module.exports.loadAll = function (req, res, next) {
  socialNetworkModel
    .loadAll()
    .then(socialNetworks => res.json(socialNetworks))
    .catch(next);
};

module.exports.save = function (req, res, next) {
  let socialNetwork = controllerUtils.extractObjectFromRequest(req);
  if (socialNetwork) {
    save(socialNetwork)
      .then(socialNetwork => res.status(HTTP_CODES.OK).send(socialNetwork))
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send({message: 'Incorrect request'});
  }
}

module.exports.remove = function (req, res, next) {
  let id = controllerUtils.extractIdFromRequest(req);
  if (id) {
    socialNetworkModel
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
    socialNetworkModel
      .findById(id)
      .then(socialNetwork => res.status(HTTP_CODES.OK).send(socialNetwork))
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send({message: 'Incorrect request'});
  }
};