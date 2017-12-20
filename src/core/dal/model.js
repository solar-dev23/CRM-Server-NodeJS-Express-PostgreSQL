'use strict';

const _ = require('lodash');
const dalUtils = require('./dal-utils');

const database = require('../../database');
const sequelize = database.sequelize;
const Sequelize = database.Sequelize;

class Model {

  constructor(modelName, fields, queryOrderFields) {
    this._modelName = modelName;
    this._fields = fields;
    this._queryOrderFields = queryOrderFields;
    this._sequelizeModel = null;
  }

  init() {
    // do nothing
  }

  get sequelizeModel() {
    return this._sequelizeModel;
  }

  buildModel(attributes, options = {}, sortOrderField) {
    options = _.assign(options, {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    });

    // Init model attributes with save columns order
    this._fields = !this._fields ? _.keys(attributes) : this._fields;
    if (!this._fields) {
      this._fields = _.keys(attributes);
    }
    this._fields.indexOf('id') < 0 && this._fields.unshift('id');

    if(sortOrderField) {
      if(!attributes[sortOrderField]){
        attributes = _.assign(attributes, {
          [sortOrderField]: {type: Sequelize.INTEGER, autoIncrement: true, field: _.snakeCase(sortOrderField)}
        });
      }
      sortOrderField && this._fields.indexOf(sortOrderField) < 0 && this._fields.push(sortOrderField);
    }

    attributes = _.assign({
        id: {primaryKey: true, type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4}
      },
      attributes,
      {
        createdAt: attributes.createdAt || {type: Sequelize.DATE, field: 'created_at'},
        updatedAt: attributes.updatedAt || {type: Sequelize.DATE, field: 'updated_at'},
      });

    this._sequelizeModel = sequelize.define(this._modelName, attributes, options);

    dalUtils.registerModel(this._sequelizeModel, this._fields, sortOrderField);
  }

  findById(id, transaction) {
    return this.findOne({id: id}, transaction);
  };

  findOne(filter, transaction) {
    return this._sequelizeModel.findOne({attributes: this._fields, where: filter, transaction: transaction});
  }

  loadAll(transaction) {
    return this.find(null, transaction);
  }

  find(filter, transaction) {
    return this._sequelizeModel.findAll({
      attributes: this._fields,
      order: this._queryOrderFields,
      transaction: transaction,
      where: filter ? filter : undefined
    });
  };

  save(object, transaction) {
    let resPromise;
    if (object.id) {
      resPromise = this._sequelizeModel
        .update(object, {
          where: {id: object.id},
          transaction: transaction
        })
        .then(() => object);
    } else {
      resPromise = this._sequelizeModel.create(object, {transaction: transaction});
    }
    return resPromise.then(object => dalUtils.prepareForClient(object, this._fields));
  }

  removeById(id, transaction) {
    return this.remove({id: id}, transaction)
  }

  remove(filter, transaction) {
    return this._sequelizeModel.destroy({
      where: filter ? filter : undefined,
      transaction: transaction
    });
  }

  getSequelizeInstanceValues(object) {
    return dalUtils.getSequelizeInstanceValues(object);
  }
}

module.exports = Model;
