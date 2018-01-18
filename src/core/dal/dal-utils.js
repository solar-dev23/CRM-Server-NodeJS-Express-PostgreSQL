'use strict';

const _ = require('lodash');
const database = require('../../database');
const sequelize = database.sequelize;

let associationsMetadataByEntityName = {};
let modelMetadataByEntityName = {};

const getAssociationsMetadata = function (model) {
  return associationsMetadataByEntityName[model.name];
};

const getSequelizeInstanceValues = function (object) {
  return object && object.$Model ? object.dataValues : object;
};

const prepareForClient = function (obj, fields) {
  if (obj && fields) {
    let data = {};
    _.forEach(fields, (field) => {
      data[field] = obj[field];
    });
    obj = data;
  }
  return obj;
};

const getModel = function (entity) {
  return typeof entity === "string" ? modelMetadataByEntityName[entity].model : entity;
};

const prepareWithChildrenToSave = function (object, model) {
  let associations = getAssociationsMetadata(model);
  _.forEach(associations, (association) => {
    let childObjects = object[association.fieldName];
    childObjects && association.sortOrderField && _.forEach(childObjects, (childObject, index) =>
      childObject[association.sortOrderField] = index + 1);
    association.onSaveHandler && association.onSaveHandler([object]);
console.log("============================");
console.log(association.sortOrderField);
console.log("============================");
  });
};

const createIncludeCondition = function (associations) {
  let condition = [];
  _.forEach(associations, (association) => {
    condition.push({association: association.association});
  });
  return condition;
};

const removeWithChildrenByFilter = function (entity, filter, transaction) {
  let model = getModel(entity);

  return model.destroy({
    include: createIncludeCondition(getAssociationsMetadata(model)),
    where: filter,
    transaction: transaction
  });
};

const createWithChildren = function (object, model, transaction) {
  let belongsToManyAssociations = [];
  let associations = _.filter(getAssociationsMetadata(model), (association) => {
    let belongsToMany = !!association.throughModel;
    belongsToMany && belongsToManyAssociations.push(association);
    return !belongsToMany;
  });
  return model
    .create(object, {include: createIncludeCondition(associations), transaction: transaction})
    .then(savedObject => {
      savedObject = getSequelizeInstanceValues(savedObject);
      object.id = savedObject.id;
      let promises = [];
      _.forEach(belongsToManyAssociations, (association) => {
        promises.push(updateChildrenForBelongsToManyAssociation(object, association, transaction));
        savedObject[association.fieldName] = object[association.fieldName];
      });
      return Promise.all(promises).then(() => savedObject);
    });
};

const buildLoadQueryAttributes = function (model, associations, filter, transaction, fields) {
  fields = fields || modelMetadataByEntityName[model.name].fields;

  let conditions = [];
  _.forEach(associations, (association) => {
    if (association.targetName === association.sourceName) {
      let condition = {};
      condition[association.parentIdentifierField] = null;
      conditions.push(condition)
    }
  });
  filter && conditions.push(filter);
  if (conditions.length > 0) {
    conditions = conditions.length > 1 ? {$and: conditions} : conditions[0];
  } else {
    conditions = undefined;
  }
  let order = _.filter(associations, association => !!association.sortOrderField);
  order = _.map(order, association => [{model: association.association.target, as: association.fieldName},
    association.sortOrderField, 'ASC']);

  return {
    attributes: fields,
    include: _.map(getAssociationsMetadata(model), (association) => {
      return {
        model: association.association.target,
        attributes: association.fields,
        as: association.fieldName
      }
    }),
    order: order,
    where: conditions,
    transaction: transaction
  };
};

const initializeLoadQueryResults = function (objects, associations) {
  _.forEach(associations, (association) => {
    association.onLoadHandler && association.onLoadHandler(objects);
    if (association.throughModel) {
      _.forEach(objects, (object) => {
        _.forEach(object[association.fieldName], (child) => {
          let value = getSequelizeInstanceValues(child);
          value && delete value[association.throughModel.name];
        })
      });
    }
  });
  return objects;
};

const loadWithChildren = function (entity, filter, transaction, fields) {
  let model = getModel(entity);
  let associations = getAssociationsMetadata(model);
  let query = buildLoadQueryAttributes(model, associations, filter, transaction, fields);

  return model
    .findAll(query)
    .then((objects) => initializeLoadQueryResults(objects, associations));
};

const updateChildrenForAssociation = function (object, association, transaction) {
  let model = association.targetModel;
  let parentCondition = {};
  parentCondition[association.parentIdentifierField] = object.id;

  return model
    .findAll({attributes: ['id'], where: parentCondition, transaction: transaction})
    .then((childObjects) => {
      let toUpdateObjects = [];
      let toRemoveIds = [];
      let toCreateObjects = [];
      let promises = [];
      let childObjectIds = new Set();
      _.forEach(childObjects, (childObject) => childObjectIds.add(childObject.id));
      _.forEach(object[association.fieldName], (childObject) => {
        if (childObjectIds.has(childObject.id)) {
          childObject[association.parentIdentifierField] = object.id;
          toUpdateObjects.push(childObject);
          childObjectIds.delete(childObject.id);
        } else {
          childObject[association.parentIdentifierField] = object.id;
          toCreateObjects.push(childObject);
        }
      });
      _.forEach(toUpdateObjects, (childObject) => {
        promises.push(association.targetModel.update(childObject,
          {where: {id: childObject.id}, transaction: transaction}));
      });
      childObjectIds.forEach(id => toRemoveIds.push(id));
      if (toRemoveIds.length > 0) {
        promises.push(association.targetModel.destroy({where: {id: {$in: toRemoveIds}}, transaction: transaction}));
      }
      if (toCreateObjects.length > 0) {
        promises.push(association.targetModel.bulkCreate(toCreateObjects,
          {
            transaction: transaction,
            validate: true
          })
          .then(createdObjects => {
            _.forEach(createdObjects, (object, index) => toCreateObjects[index].id = object.id);
          }));
      }
      return Promise.all(promises);
    });
};

const updateChildrenForBelongsToManyAssociation = function (object, association, transaction) {
  let throughModel = association.throughModel;
  /* ------ Original code commented by Lucas. ---------- */
  // let objectIdField = throughModel.primaryKeyAttribute;
  // let targetObjectIdField = throughModel.primaryKeyAttributes[1];
  /* --------------------------------------------------- */
  
  // Updated code edited by Lucas(2018-01-18)
  let objectIdField = association.parentIdentifierField;
  let targetObjectIdField = throughModel.primaryKeyAttributes.filter(attr => {
    return attr !== objectIdField
  })[0];

  let children = _.map(object[association.fieldName], (child) => {
    let res = {};
    res[objectIdField] = object.id;
    res[targetObjectIdField] = child.id;
    return res;
  });

  return throughModel
    .destroy({where: _.set({}, objectIdField, object.id), transaction: transaction})
    .then(() => throughModel.bulkCreate(children, {transaction: transaction}));
};

const updateChildren = function (object, associations, transaction) {
  let promises = [];
  _.forEach(associations, (association) => {
    promises.push(!association.throughModel ?
      updateChildrenForAssociation(object, association, transaction) :
      updateChildrenForBelongsToManyAssociation(object, association, transaction)
    );
  });
  return Promise.all(promises);
};

const saveWithChildren = function (entity, object, transaction, fields) {
  let model = getModel(entity);
  fields = fields || modelMetadataByEntityName[model.name].fields;

  prepareWithChildrenToSave(object, model);
  let associations = getAssociationsMetadata(model);
  let savePromise;
  if (object.id) {
    savePromise = model
      .update(object, {where: {id: object.id}, transaction: transaction})
      .then(() => object);
    if (associations) {
      savePromise = savePromise
        .then(() => updateChildren(object, associations, transaction))
        .then(() => object);
    }
  } else {
    savePromise = createWithChildren(object, model, transaction);
  }
  return savePromise.then((object) => {
    let itemToClient = prepareForClient(object, fields);
    _.forEach(associations, (association) => {
      let childObjects = object[association.fieldName];
      if (childObjects) {
        if (!association.onLoadHandler) {
          itemToClient[association.fieldName] = _.map(childObjects, (childObject) => {
            return prepareForClient(childObject, association.fields)
          });
        } else {
          itemToClient[association.fieldName] = object[association.fieldName];
          association.onLoadHandler([itemToClient]);
        }
      }
    });
    return itemToClient;
  });
};

module.exports.registerModel = function (model, fields, sortOrderField) {
  if (sortOrderField && _.indexOf(fields, sortOrderField) < 0) {
    fields = _.clone(fields);
    fields.push(sortOrderField);
  }
  modelMetadataByEntityName[model.name] = {model: model, fields: fields, sortOrderField: sortOrderField};
};

module.exports.unregisterModel = function (model) {
  delete modelMetadataByEntityName[model.name];
  delete associationsMetadataByEntityName[model.name];
};

module.exports.registerAssociation = function (childAssociation, childFields, onLoadHandler, onSaveHandler) {
  let targetEntityName = childAssociation.target.name;
  let sourceEntityName = childAssociation.source.name;
  let targetModelMetadata = modelMetadataByEntityName[targetEntityName];
  let associations = associationsMetadataByEntityName[sourceEntityName];
  if (!associations) {
    associations = [];
    associationsMetadataByEntityName[sourceEntityName] = associations;
  }
  associations.push({
    fieldName: childAssociation.associationAccessor,
    association: childAssociation,
    fields: childFields || targetModelMetadata.fields,
    sortOrderField: targetModelMetadata.sortOrderField,
    targetName: targetEntityName,
    targetModel: childAssociation.target,
    throughModel: childAssociation.throughModel,
    sourceName: sourceEntityName,
    sourceModel: childAssociation.source,
    parentIdentifierField: childAssociation.identifierField,
    onLoadHandler: onLoadHandler,
    onSaveHandler: onSaveHandler
  });
};

module.exports.saveWithChildren = function (entity, object, transaction, fields) {
  object = getSequelizeInstanceValues(object);
  return !transaction ? sequelize.transaction(localTransaction => saveWithChildren(entity, object,
    localTransaction, fields)) : saveWithChildren(entity, object, transaction, fields);
};

module.exports.loadWithChildren = loadWithChildren;

module.exports.removeWithChildrenByFilter = removeWithChildrenByFilter;

module.exports.prepareForClient = prepareForClient;

module.exports.getSequelizeInstanceValues = getSequelizeInstanceValues;