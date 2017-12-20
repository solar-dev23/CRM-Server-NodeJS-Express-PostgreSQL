'use strict';

const Model = require('./model');
const dalUtils = require('./dal-utils');

class ContainerModel extends Model {
  constructor(modelName, fields) {
    super(modelName, fields);
  }

  createBelongsToManyAssociation(fieldName, through, foreignKey, targetModel, childFields) {
    this.sequelizeModel[fieldName] = this.sequelizeModel.belongsToMany(targetModel, {
      as: fieldName,
      through: through,
      foreignKey: foreignKey
    });
    dalUtils.registerAssociation(this.getAssociation(fieldName), childFields);
  }

  getAssociation(fieldName) {
    return this.sequelizeModel[fieldName];
  }

  find(filter, transaction) {
    return dalUtils.loadWithChildren(this.sequelizeModel, filter, transaction);
  };

  findOne() {
    throw new Error('This functionality does not supported');
  }

  findById(id, transaction) {
    return this
      .find({id: id}, transaction)
      .then(objects => objects && objects.length > 0 ? objects[0] : null);
  };

  save(object, transaction) {
    return dalUtils.saveWithChildren(this.sequelizeModel, object, transaction);
  }

  remove(filter, transaction) {
    return dalUtils.removeWithChildrenByFilter(this.sequelizeModel, filter, transaction);
  }
}

module.exports = ContainerModel;
