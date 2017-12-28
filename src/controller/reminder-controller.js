const model = require('../model');
const reminderModel = model.reminderModel;
const _ = require('lodash');

module.exports = {
	 create(req, res) {
    return reminderModel
      .create(req.body)
      .then(reminder => res.status(201).send(reminder))
      .catch(error => res.status(400).send(error));
  },
  list(req, res) {
    return reminderModel
      .findAll()
      .then(reminders => {
          res.status(200).send(reminders);
      })
      .catch(error => res.status(400).send(error));
  },
  update(req, res) {
    return reminderModel
      .find({
        where: {
          user_id: req.body.user_id,
          opportunity_id: req.body.opportunity_id
        }
      }).then(reminder => {
          if(!reminder){
            return reminderModel
              .create(req.body)
              .then(reminder => res.status(201).send(reminder))
              .catch(error => res.status(400).send(error));
          }

          return reminder
            .update(req.body)
            .then(() => res.status(200).send(reminder))
            .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  },
  remove(req, res)  {
    return reminderModel
      .findById(req.body.Id)
      .then(reminder => {
          if (!reminder) {
            return res.status(400).send({
              message: 'Reminder Not Found',
            });
          }

          return reminder
            .destroy()
            .then(() => res.status(204).send({message: 'ok'}))
            .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  },
  getOne(req, res) {
    return reminderModel
      .findOne({
        where: {
          user_id: req.query.user_id,
          opportunity_id: req.query.opportunity_id
        }
      })
      .then(reminder => {
          if (!reminder) {
            return res.status(400).send({
              message: 'Reminder Not Found',
            });
          }

          res.status(200).send(reminder);
      })
      .catch(error => res.status(400).send(error));
  }
}