const model = require('../model');
const statusModel = model.statusModel;
const opportunityModel = model.opportunityModel;
const core = require('../core');
const controllerUtils = core.controllerUtils;
const HTTP_CODES = core.HTTP_CODE;
const _ = require('lodash');

const save = async function (status) {
  return await statusModel.save(status);
};

module.exports.loadAll = function (req, res, next) {
  statusModel
    .loadAll()
    .then(statuses => {
      statuses = _.orderBy(statuses, ['order'], ['asc']);
      res.json(statuses)
    })
    .catch(next);
};

module.exports.save = function (req, res, next) {
  let status = controllerUtils.extractObjectFromRequest(req);
  if (status) {
    save(status)
      .then(status => res.status(HTTP_CODES.OK).send(status))
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send('Incorrect request');
  }
};

module.exports.remove = function (req, res, next) {
  if (req.body.id) {
    let opportunities = req.body.opportunities;
    _.each(opportunities, function(opportunity) {
        // Delete active opportunities
        if(opportunity.is_active){
          opportunityModel
            .findById(opportunity.id)
            .then(opportunity => {
              opportunity
                .destroy()
                .then(() => res.status(HTTP_CODES.OK).send())
                .catch(error => res.status(HTTP_CODES.BAD_REQUEST).send('Incorrect request'));
            })
            .catch(error => res.status(HTTP_CODES.BAD_REQUEST).send('Incorrect request'));
        }else {
          // Update status_id = 100 for archived opportunities
          opportunityModel
            .findById(opportunity.id)
            .then(opportunity => {
              opportunity
                .update({ status_id: 100 })
                .then()
                .catch(error => res.status(HTTP_CODES.BAD_REQUEST).send('Incorrect request'));
            })
            .catch(error => res.status(HTTP_CODES.BAD_REQUEST).send('Incorrect request'));
        }
    });

    statusModel
      .removeById(req.body.id)
      .then(() => res.status(HTTP_CODES.OK).send())
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send('Incorrect request');
  }
};

module.exports.reorder = function (req, res, next) {
  let data = req.body;
  _.each(data, function(status, i) {
    statusModel
      .findById(status.id)
      .then(status => {
        status
          .update({
            order: i+1 || status.order
          })
          .then()
          .catch(error => res.status(HTTP_CODES.BAD_REQUEST).send('Incorrect request'));
      })
      .catch(error => res.status(HTTP_CODES.BAD_REQUEST).send('Incorrect request'));
  });
  
  return res.status(HTTP_CODES.OK).send('Status reordered successfully.');
}