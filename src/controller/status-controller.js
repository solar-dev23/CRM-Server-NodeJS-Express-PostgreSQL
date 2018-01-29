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

const reorder = async function(data) {
  await Promise.all(data.map(async(status, i) => {
    await statusModel
      .findById(status.id)
      .then(async (status) => {
        await status
              .update({
                order: i+1 || status.order
              })
              .then()
              .catch(error => res.status(HTTP_CODES.BAD_REQUEST).send({message: 'Incorrect request'}))
      })
      .catch(error => res.status(HTTP_CODES.BAD_REQUEST).send({message: 'Status not found'}));
  }))
};

const remove = async function(opportunities) {
  await Promise.all(opportunities.map(async(opportunity) => {
      // Delete active opportunities
      if (opportunity.is_active) {
        await opportunityModel
          .findById(opportunity.id)
          .then(async (opportunity) => {
            await opportunity
              .destroy()
              .then()
              .catch(error => res.status(HTTP_CODES.BAD_REQUEST).send({message: 'Incorrect request'}))
          })
          .catch(error => res.status(HTTP_CODES.BAD_REQUEST).send({message: 'Incorrect request'}))
      }else {
        // Update status_id for archived opportunities
        let archivedStatus = await statusModel.findOne({name: 'Archived'});
        console.log(archivedStatus);

        await opportunityModel
          .findById(opportunity.id)
          .then(async (opportunity) => {
            await opportunity
              .update({ status_id: archivedStatus.dataValues.id })
              .then()
              .catch(error => res.status(HTTP_CODES.BAD_REQUEST).send({message: 'Incorrect request'}))
          })
          .catch(error => res.status(HTTP_CODES.BAD_REQUEST).send({message: 'Incorrect request'}))
      }
  }));
}

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
    res.status(HTTP_CODES.BAD_REQUEST).send({message: 'Incorrect request'});
  }
};

module.exports.remove = function (req, res, next) {
  if (req.body.id) {
    let opportunities = req.body.opportunities;
    remove(opportunities)
      .then(() => {
        statusModel
          .removeById(req.body.id)
          .then(() => {
            return res.status(HTTP_CODES.OK).send({message: 'Successfully removed'});
          })
          .catch(next);
      })
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send({message: 'Incorrect request'});
  }
};

module.exports.reorder = function (req, res, next) {
  let data = req.body;
  reorder(data).then(() => {
    return res.status(HTTP_CODES.OK).send({message: 'Status reordered successfully.'});
  });
}