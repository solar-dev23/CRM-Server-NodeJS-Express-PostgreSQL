const model = require('../model');
const roleModel = model.roleModel;
const core = require('../core');
const controllerUtils = core.controllerUtils;
const HTTP_CODES = core.HTTP_CODE;
const _ = require('lodash');

const save = async function (role) {
  return await roleModel.save(role);
};

module.exports.loadAll = function (req, res, next) {
  roleModel
    .loadAll()
    .then(roles => res.json(roles))
    .catch(next);
};

module.exports.save = function (req, res, next) {
  let role = controllerUtils.extractObjectFromRequest(req);
  if (role) {
    save(role)
      .then(role => res.status(HTTP_CODES.OK).send(role))
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send({message: 'Incorrect request'});
  }
}

module.exports.remove = function (req, res, next) {
  let id = controllerUtils.extractIdFromRequest(req);
  if (id) {
    roleModel
      .removeById(id)
      .then(() => res.status(HTTP_CODES.OK).send())
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send({message: 'Incorrect request'});
  }
};
