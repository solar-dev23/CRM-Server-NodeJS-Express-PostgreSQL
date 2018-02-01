'use strict';

const database = require('../database');
const Sequelize = database.Sequelize;

const core = require('../core');
const Model = core.Model;

const MODEL_ATTRIBUTES = {
	facebook: {type: Sequelize.STRING},
  twitter: {type: Sequelize.STRING},
  linked_in: {type: Sequelize.STRING},
  instagram: {type: Sequelize.STRING},
  pinterest: {type: Sequelize.STRING},
  youtube: {type: Sequelize.STRING},
  google_plus: {type: Sequelize.STRING}
};

class SocialNetworkModel extends Model {
  constructor() {
    super('social_networks');
    this.buildModel(MODEL_ATTRIBUTES);
  }
}

module.exports = new SocialNetworkModel();

