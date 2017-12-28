const model = require('../model');
const statusModel = model.statusModel;
const _ = require('lodash');

module.exports = {
	create(req, res) {
    let isDuplicated = false;

    statusModel.loadAll()
      .then(statuses => {
        _.each(statuses, function(status) {
          if(status.name.toLowerCase() == req.body.name.toLowerCase())
            isDuplicated = true;
        });
    
        if(isDuplicated) {
          return res.status(400).send({
              "errors": [
                {
                  "message": "name must be unique."
                }
              ]
            })
        }else {
          return statusModel
            .save({
              name: req.body.name,
              order: req.body.order
            })
            .then(status => res.status(201).send(status))
            .catch(error => res.status(400).send(error));
        }
      })
      .catch(error => res.status(400).send(error));
  },
  list(req, res) {
    return statusModel
      // .findAll({order:['order']})
      .loadAll()
      .then(status => {
          res.status(200).send(status);
      })
      .catch(error => res.status(400).send(error));
  },
  update(req, res) {
    return statusModel
      .findById(req.body.id)
      .then(status => {
          if (!status) {
            return res.status(404).send({
              message: 'Status Not Found',
            });
          }

          return status
            .update({
              name: req.body.name || status.name
            })
            .then(() => res.status(200).send(status))
            .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  },
  remove(req, res)  {
    return statusModel
      .findById(req.body.id)
      .then(status => {
          if (!status) {
            return res.status(400).send({
              message: 'Status Not Found',
            });
          }

          let opportunities = req.body.opportunities;
          _.each(opportunities, function(opportunity) {
              // Delete active opportunities
              if(opportunity.is_active){
                Opportunity
                  .findById(opportunity.id)
                  .then(opportunity => {
                    opportunity
                      .destroy()
                      .then(() => res.status(204).send({message: 'ok'}))
                      .catch(error => res.status(400).send(error));
                  })
                  .catch(error => res.status(400).send(error));
              }else {
                // Update status_id = 100 for archived opportunities
                Opportunity
                  .findById(opportunity.id)
                  .then(opportunity => {
                    opportunity
                      .update({ status_id: 100 })
                      .then()
                      .catch(error => res.status(400).send(error));
                  })
                  .catch(error => res.status(400).send(error));
              }
          });

          return status
            .destroy()
            .then(() => res.status(204).send({message: 'ok'}))
            .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  },
  reorder(req, res) {
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
            .catch(error => res.status(400).send(error));
        })
        .catch(error => res.status(400).send(error));
    });
    
    return res.status(200).send({message: 'Status reordered successfully.'});
  }
}