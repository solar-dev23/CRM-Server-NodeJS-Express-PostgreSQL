const model = require('../model');
const opportunityModel = model.opportunityModel;
const userModel = model.userModel;
const core = require('../core');
const controllerUtils = core.controllerUtils;
const HTTP_CODES = core.HTTP_CODE;
const mail = require('../mail');
const _ = require('lodash');

const save = async function (opportunity) {
  return await opportunityModel.save(opportunity);
};

const reorder = async function(data) {
  await Promise.all(data.map(async(status, i) => {
    await Promise.all(status.widgets.map(async(opportunity, j) => {
        await opportunityModel
          .findById(opportunity.id)
          .then(async (opportunity) => {
            await opportunity
              .update({
                status_id: status.id || opportunity.status_id,
                order: j+1 || opportunity.order
              })
              .then()
              .catch(error => res.status(HTTP_CODES.BAD_REQUEST).send({message: 'Incorrect request'}));
          })
          .catch(error => res.status(HTTP_CODES.BAD_REQUEST).send({message: 'Opportunity not found'}));
    }))
  }))
};

const archiveAll = async function(opportunities) {
  await Promise.all(opportunities.map(async(opportunity) => {
    await opportunityModel
        .findById(opportunity.id)
        .then(async (opportunity) => {
          await opportunity
            .update({ is_active: false })
            .then()
            .catch(error => res.status(HTTP_CODES.BAD_REQUEST).send({message: 'Incorrect request'}));
        })
        .catch(error => res.status(HTTP_CODES.BAD_REQUEST).send({message: 'Opportunity not found'}));
  }));
}

module.exports.loadAll = function (req, res, next) {
  opportunityModel
    .loadAll()
    .then(opportunities => {
      opportunities = _.orderBy(opportunities, ['order'], ['asc']);
      res.json(opportunities)
    })
    .catch(next);
};

module.exports.save = function (req, res, next) {
  let opportunity = controllerUtils.extractObjectFromRequest(req);
  if (opportunity) {
    opportunity.notify_users = updateNotifyUsers(opportunity).toString();

    save(opportunity)
      .then((opportunity) => {
        let notify_users = updateNotifyUsers(opportunity);
        if(notify_users.length>0){         
          mail.sendNotifyMessages(notify_users, opportunity.name);
        }

        res.status(HTTP_CODES.OK).send(opportunity);
      })
      .catch(error => {
        res.status(HTTP_CODES.BAD_REQUEST).send(error.errors[0]);
      });
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send({message:'Incorrect request'});
  }
};

module.exports.remove = function (req, res, next) {
  let id = controllerUtils.extractIdFromRequest(req);
  if (id) {
    opportunityModel
      .removeById(id)
      .then(() => res.status(HTTP_CODES.OK).send({message: 'Successfully removed'}))
      .catch(next);
  } else {
    res.status(HTTP_CODES.BAD_REQUEST).send({message: 'Incorrect request'});
  }
};

module.exports.reorder = async function(req, res, next) {
  let data = req.body;
  reorder(data).then(() => {
    return res.status(HTTP_CODES.OK).send({message: 'Opportunity reordered successfully.'});
  });
};

module.exports.archiveAll = function(req, res, next) {
  let opportunities = req.body.opportunities;
  archiveAll(opportunities).then(() => {
    return res.status(HTTP_CODES.OK).send({message:'Opportunity archived successfully.'});
  });
};

const updateNotifyUsers = function (opportunity) {
  let notify_users_ary;
  
  if(!opportunity.notify_users)
    notify_users_ary = [];
  else
    notify_users_ary = opportunity.notify_users.split(',');

  if (opportunity.notify) {
    if(notify_users_ary.indexOf(opportunity.notify_user_id) === -1){
      notify_users_ary.push(opportunity.notify_user_id);
    }
  } else {
    var index = notify_users_ary.indexOf(opportunity.notify_user_id);
    if(index !== -1){
      notify_users_ary.splice(index, 1);
    }
  }

  return notify_users_ary;
};
