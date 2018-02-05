const model = require('../model');
const departmentModel = model.departmentModel;
const core = require('../core');
const controllerUtils = core.controllerUtils;
const HTTP_CODES = core.HTTP_CODE;
const _ = require('lodash');

const save = async function (department) {
  return await departmentModel.save(department);
};

module.exports.loadAll = function (req, res, next) {
  departmentModel
    .loadAll()
    .then(departments => res.json(departments))
    .catch(next);
};

module.exports.save = function (req, res, next) {
  let department = controllerUtils.extractObjectFromRequest(req); 
  if (department) {
    save(department)
      .then(department => res.status(HTTP_CODES.OK).send(department))
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send({message: 'Incorrect request'});
  }
}

module.exports.remove = function (req, res, next) {
  let id = controllerUtils.extractIdFromRequest(req);
  if (id) {
    departmentModel
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
    departmentModel
      .findById(id)
      .then(department => res.status(HTTP_CODES.OK).send(department))
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send({message: 'Incorrect request'});
  }
};