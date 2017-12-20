'use strict';

const permissionModel = require('./permission-model');

const database = require('../database');
const Sequelize = database.Sequelize;

const core = require('../core');
const ContainerModel = core.ContainerModel;

const MODEL_ATTRIBUTES = {
  title: {
    type: Sequelize.TEXT,
    allowNull: false,
    validate: {
      len: 1,
    }
  },
  default: {type: Sequelize.BOOLEAN, allowNull: false}
};

class RoleModel extends ContainerModel {

  constructor() {
    super('roles');
    this.buildModel(MODEL_ATTRIBUTES);
    this.createBelongsToManyAssociation('permissions', 'role_permissions', 'role_id',
      permissionModel.sequelizeModel, ['id']);
  }
}

module.exports = new RoleModel();
