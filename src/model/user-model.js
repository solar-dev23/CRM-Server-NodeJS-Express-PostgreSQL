'use strict';

const _ = require('lodash');
const passwordHash = require('password-hash');
const passwordGenerator = require('generate-password');
const roleModel = require('./role-model');

const database = require('../database');
const sequelize = database.sequelize;
const Sequelize = database.Sequelize;

const core = require('../core');
const validator = core.validator;
const ContainerModel = core.ContainerModel;
const ValidationError = core.error.ValidationError;

const MODEL_ATTRIBUTES = {
  username: {
    type: Sequelize.TEXT,
    validate: {
      validateUserName(value) {
        validator.checkMinLen(value, 4, 'User name should contain minimum 4 chars');
      }
    }
  },
  email: {
    type: Sequelize.TEXT,
    validate: {
      validateEmail(value) {
        validator.checkEmail(value);
      }
    }
  },
  phone: {
    type: Sequelize.STRING,
    validate: {
      validatePhoneNumber(value) {
        validator.checkPhoneNumber(value);
      }
    }
  },
  firstName: {type: Sequelize.TEXT, field: 'first_name', allowNull: false, validate: {len: 1}},
  lastName: {field: 'last_name', type: Sequelize.TEXT, allowNull: false, validate: {len: 1}},
  displayName: {field: 'display_name', type: Sequelize.TEXT, allowNull: false},
  password: {type: Sequelize.TEXT, allowNull: false},
  company: {type: Sequelize.TEXT},
  jobTitle: {field: 'job_title', type: Sequelize.TEXT},
  employeeNumber: {
    field: 'employee_number',
    type: Sequelize.INTEGER,
    validate: {
      min: 0,
    }
  },
  businessType: {field: 'business_type', type: Sequelize.TEXT},
  location: {type: Sequelize.TEXT},
  active: {type: Sequelize.BOOLEAN, allowNull: false},
  expires: {type: Sequelize.DATE},
  address_id: {type: Sequelize.UUID},
  department_id: {type: Sequelize.UUID},
  date_of_birth: {type: Sequelize.DATE},
  hire_date: {type: Sequelize.DATE},
  termination_date: {type: Sequelize.DATE},
  wide_menu: {type: Sequelize.BOOLEAN, defaultValue: true},
  image: {type: Sequelize.TEXT}
};

const MODEL_OPTIONS = {
  validate: {
    validateUser() {
      let user = this;
      if (typeof user.username !== 'undefined' && typeof user.email !== 'undefined' && !user.username && !user.email) {
        throw new ValidationError('User name or email is required');
      }
    }
  }
};

class UserModel extends ContainerModel {

  constructor() {
    super('users', ['id', 'username', 'email', 'phone', 'firstName', 'lastName', 'displayName', 'active', 'department_id', 'wide_menu', 'image', 'address_id', 'date_of_birth', 'hire_date', 'termination_date']);
    this.buildModel(MODEL_ATTRIBUTES, MODEL_OPTIONS);
    this.createBelongsToManyAssociation('roles', 'user_roles', 'user_id', roleModel.sequelizeModel, ['id']);
  }

  get roles() {
    return this.getAssociation("roles");
  }

  _findByUserNameOrEmail(fields, usernameOrEmail = '', transaction) {
    usernameOrEmail = usernameOrEmail.trim().toLowerCase();
    return this.sequelizeModel
      .findOne({
        attributes: fields,
        where: {
          $or: [
            {username: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('username')), usernameOrEmail)},
            {email: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('email')), usernameOrEmail)}
          ]
        },
        transaction: transaction
      });
  }

  save(user, transaction) {
    if (!transaction) {
      return sequelize.transaction((transaction) => {
        return this.save(user, transaction);
      });
    }

    user.password = !user.id && !user.password ? passwordGenerator.generate({
      length: 20,
      numbers: true,
      symbols: true,
      uppercase: true,
      strict: true
    }) : user.password;

    if (user.password) {
      validator.checkPassword(user.password);
      user.password = passwordHash.generate(user.password);
    } else {
      delete user["password"];
    }

    if (!user.active && !user.id) {
      user.active = false;
    }

    user.id = user.id ? user.id : undefined;
    user.username = user.username ? user.username.trim() : '';
    user.email = user.email ? user.email.trim() : '';
    user.displayName = `${user.firstName} ${user.lastName}`;
    user.employeeNumber = user.employeeNumber || null;

    return new Promise((resolve, reject) => {
      let username = user.username.toLowerCase();
      let email = user.email.toLowerCase();
      if (username || email) {
        let filter = {$or: []};
        if (user.id) {
          filter.id = {$ne: user.id};
        }
        if (username) {
          filter.$or.push({username: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('username')), username)});
          filter.$or.push({email: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('email')), username)});
        }
        if (email) {
          filter.$or.push({username: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('username')), email)});
          filter.$or.push({email: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('email')), email)});
        }
        this.sequelizeModel
          .findOne({attributes: ['id'], where: filter, transaction: transaction})
          .then((user) => {
            !user ? resolve() : reject(new ValidationError('User with this name or email is already exist'));
          })
          .catch(reject);
      } else {
        resolve();
      }
    }).then(() => super.save(user, transaction));
  }

  loadRolesByUserId(id, transaction) {
    return this.roles.throughModel.findAll({where: {user_id: id}, transaction: transaction}).then((roles) => {
      return _.map(roles, (role) => {
        return {id: role.role_id};
      });
    });
  }

  async setRoles(userId, roles, transaction) {
    roles = _.map(roles, (role) => {
      return {user_id: userId, role_id: role.id};
    });
    await this.roles.throughModel.destroy({where: {user_id: userId}, transaction: transaction});
    await this.roles.throughModel.bulkCreate(roles, {transaction: transaction});
  }

  loadAuthDataByByUsernameOrEmail(usernameOrEmail, transaction) {
    return this
      ._findByUserNameOrEmail(['id', 'password', 'active'], usernameOrEmail, transaction)
      .then((user) => {
        user = this.getSequelizeInstanceValues(user);
        let res = user;
        if (user) {
          res = this
            .loadRolesByUserId(user.id, transaction)
            .then((roles) => {
              user.roles = roles;
              return user;
            });
        }
        return res;
      });
  }

  resetPassword(id, password, transaction) {
    let user = {password: passwordHash.generate(password)};
    return this.sequelizeModel.update(user, {where: {id: id}, transaction: transaction});
  }

  findByUsernameOrEmail(usernameOrEmail = '', transaction) {
    return this._findByUserNameOrEmail(this.fields, usernameOrEmail, transaction);
  }

  activateUser(id, password, expires, transaction) {
    let user = {password: passwordHash.generate(password), active: true, expires: expires};
    return this.sequelizeModel.update(user, {where: {id: id}, transaction: transaction});
  }

  deactivateUser(id, transaction) {
    return this.sequelizeModel.update({active: false, expires: null}, {
      where: {id: id},
      transaction: transaction
    });
  }

  findExpiredUsers(limit, transaction) {
    return this.sequelizeModel.findAll({
      attributes: this.fields,
      where: {expires: {lt: new Date()}},
      order: 'expires',
      limit: limit,
      transaction: transaction
    });
  }

  getDisplayName(user) {
    return `${user.firstName} ${user.lastName}`;
  }
}

module.exports = new UserModel();
