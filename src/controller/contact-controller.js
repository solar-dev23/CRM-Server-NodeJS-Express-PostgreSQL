const model = require('../model');
const contactModel = model.contactModel;
const core = require('../core');
const controllerUtils = core.controllerUtils;
const HTTP_CODES = core.HTTP_CODE;
const _ = require('lodash');

module.exports.loadAll = function (req, res, next) {
  contactModel
    .loadAll()
    .then(contacts => res.json(contacts))
    .catch(next);
};

module.exports.save = function (req, res, next) {
	if(req.body.id){  // Update Contact
    return contactModel
      .findById(req.body.id)
      .then(contact => {
          if (!contact) {
            return res.status(404).send({
              message: 'Contact Not Found',
            });
          }

          return contact
            .update(req.body)
            .then(() => res.status(200).send(contact))
            .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  }else {           // Create Contact
    return contactModel
      .save(req.body)
      .then(contact => res.status(201).send(contact))
      .catch(error => res.status(400).send(error));
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