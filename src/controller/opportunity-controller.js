const model = require('../model');
const opportunityModel = model.opportunityModel;
const userModel = model.userModel;
const _ = require('lodash');

module.exports = {
	save(req, res) {
    if(req.body.id){  // Update Opportunity
      return opportunityModel
        .findById(req.body.id)
        .then(opportunity => {
            if (!opportunity) {
              return res.status(404).send({
                message: 'Opportunity Not Found',
              });
            }

            let notify_users_ary, notify_users_str;

            if(req.body.notify) {
              if(!opportunity.dataValues.notify_users)
                notify_users_ary = [];
              else
                notify_users_ary = opportunity.dataValues.notify_users.split(',');

              if(req.body.notify.value){
                if(notify_users_ary.indexOf(req.body.notify.id) === -1){
                  notify_users_ary.push(req.body.notify.id);
                }
              }else {
                var index = notify_users_ary.indexOf(req.body.notify.id);
                if(index !== -1){
                  notify_users_ary.splice(index, 1);
                }
              }

              notify_users_str = notify_users_ary.toString();
            }else {
              if(!opportunity.dataValues.notify_users){
                notify_users_ary = [];
                notify_users_str = '';
              }
              else{
                notify_users_ary = opportunity.dataValues.notify_users.split(',');
                notify_users_str = opportunity.dataValues.notify_users;
              }
            }

            if(notify_users_ary.length > 0){
              // userModel
              //   .findAll({
              //     where: {
              //         id: { $in: notify_users_ary }
              //     }
              //   }).then(users => {
              //     // sendMail(users, opportunity.name);
              //   }).catch(error => res.status(400).send(error));
              
              userModel
                .loadAll().then(users => {
                  // sendMail(users, opportunity.name);
                }).catch(error => res.status(400).send(error));
            }


            return opportunity
              .update({
                status_id: req.body.status_id,
                name: req.body.name,
                company: req.body.company,
                contact: req.body.contact,
                value: req.body.value,
                currency: req.body.currency,
                rating: req.body.rating,
                description: req.body.description,
                bgColor: req.body.bgColor,
                order: req.body.order,
                is_active: req.body.is_active,
                user_id: req.body.user_id,
                notify_users: notify_users_str
              })
              .then(() => res.status(200).send(opportunity))
              .catch(error => res.status(400).send(error));
        })
        .catch(error => res.status(400).send(error));
    }else {           // Create Opportunity
      let isDuplicated = false;

      opportunityModel.loadAll()
        .then(opportunities => {
          _.each(opportunities, function(opportunity) {
            if(opportunity.name.toLowerCase() == req.body.name.toLowerCase())
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
            return opportunityModel
              .create(req.body)
              .then(opportunity => res.status(201).send(opportunity))
              .catch(error => res.status(400).send(error));
          }
        })
        .catch(error => res.status(400).send(error));      
      }
  },
  list(req, res) {
    return opportunityModel
      // .findAll({order:['id']})
      .loadAll()
      .then(opportunities => {
          opportunities = _.orderBy(opportunities, ['order'], ['asc']);
          res.status(200).send(opportunities);
      })
      .catch(error => res.status(400).send(error));
  },
  update(req, res) {
    return opportunityModel
      .findById(req.body.id)
      .then(opportunity => {
          if (!opportunity) {
            return res.status(404).send({
              message: 'Opportunity Not Found',
            });
          }

          let notify_users_ary, notify_users_str;

          if(req.body.notify) {
            if(!opportunity.dataValues.notify_users)
              notify_users_ary = [];
            else
              notify_users_ary = opportunity.dataValues.notify_users.split(',');

            if(req.body.notify.value){
              if(notify_users_ary.indexOf(req.body.notify.id) === -1){
                notify_users_ary.push(req.body.notify.id);
              }
            }else {
              var index = notify_users_ary.indexOf(req.body.notify.id);
              if(index !== -1){
                notify_users_ary.splice(index, 1);
              }
            }

            notify_users_str = notify_users_ary.toString();
          }else {
            if(!opportunity.dataValues.notify_users){
              notify_users_ary = [];
              notify_users_str = '';
            }
            else{
              notify_users_ary = opportunity.dataValues.notify_users.split(',');
              notify_users_str = opportunity.dataValues.notify_users;
            }
          }

          if(notify_users_ary.length > 0){
            // userModel
            //   .findAll({
            //     where: {
            //         id: { $in: notify_users_ary }
            //     }
            //   }).then(users => {
            //     // sendMail(users, opportunity.name);
            //   }).catch(error => res.status(400).send(error));
            
            userModel
              .loadAll().then(users => {
                // sendMail(users, opportunity.name);
              }).catch(error => res.status(400).send(error));
          }


          return opportunity
            .update({
              status_id: req.body.status_id,
              name: req.body.name,
              company: req.body.company,
              contact: req.body.contact,
              value: req.body.value,
              currency: req.body.currency,
              rating: req.body.rating,
              description: req.body.description,
              bgColor: req.body.bgColor,
              order: req.body.order,
              is_active: req.body.is_active,
              user_id: req.body.user_id,
              notify_users: notify_users_str
            })
            .then(() => res.status(200).send(opportunity))
            .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  },
  remove(req, res)  {
    return opportunityModel
      .findById(req.body.id)
      .then(opportunity => {
          if (!opportunity) {
            return res.status(400).send({
              message: 'Opportunity Not Found',
            });
          }

          return opportunity
            .destroy()
            .then(() => res.status(204).send({message: 'ok'}))
            .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  },
  reorder(req, res) {
    let data = req.body;
    _.each(data, function(status, i) {
      _.each(status.widgets, function(opportunity, j) {
          opportunityModel
            .findById(opportunity.id)
            .then(opportunity => {
              opportunity
                .update({
                  status_id: status.id || opportunity.status_id,
                  order: j+1 || opportunity.order
                })
                .then()
                .catch(error => res.status(400).send(error));
            })
            .catch(error => res.status(400).send(error));
      })
    });

    return res.status(200).send({message: 'Opportunity reordered successfully.'});
  },
  archiveAll(req, res) {
    let opportunities = req.body.opportunities;
    _.each(opportunities, function(opportunity) {
        opportunityModel
          .findById(opportunity.id)
          .then(opportunity => {
            opportunity
              .update({ is_active: false })
              .then()
              .catch(error => res.status(400).send(error));
          })
          .catch(error => res.status(400).send(error));
    });

    return res.status(200).send({message: 'Opportunities archived successfully.'});
  }
};

// function sendMail(users, opprtunityName) {
//   _.each(users, function(user){
//     var smtpTransport = nodemailer.createTransport({
//       service: "Gmail",
//       auth: {
//         user: config.gmail.user,
//         pass: config.gmail.pass
//         // XOAuth2: {
//         //   user: "crm@mateam.net", // Your gmail address.
//         //   pass: "mr&5Nur5",
//         //   clientId: "466949402970-eqjk19cv1p1a8ksf2ji7id0plll5skg9.apps.googleusercontent.com",
//         //   clientSecret: "0b6vgJsiKa4HdJuFrQzNkkel",
//         //   refreshToken: "1/nwVRzclQ9lKnQiZUUQAc6vIj3HAr4Ciic4wy-Yc88wE",
//         //   accessToken: "ya29.Glv2BH3UlGt7Q-4_gv29tR_lTjGviwtnBjCjQ9pMpucm8uz3m6_tP2Oa-hvlkE3nxEAZnY6yCingwH6fqGneMWeqFuXIzDLmRpCjfbl-b676N_z5QTEcWwPhv69B",
//         //   timeout: 3600
//         // }
//       }
//     });

//     var mailOptions = {
//       from: config.gmail.user,
//       to: user.Email,
//       subject: "Notify Email",
//       generateTextFromHTML: true,
//       html: '<span>The "'+opprtunityName+'" opportunity has been updated.</span>'
//     };

//     smtpTransport.sendMail(mailOptions, function(error, response) {
//       if (error) {
//         console.log(error);
//       } else {
//         console.log(response);
//       }

//       smtpTransport.close();
//     });

//   })
// }