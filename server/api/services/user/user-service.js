const _ = require("lodash");
const loggerHelper = require("../../../common/logger-helper");
const Bcrypt = require("bcrypt");
const UserServiceError = require("./user-service-error");
const userDao = require("./user-dao");
const Knex = require("knex");
const { result } = require("lodash");
const saltRounds = 10;

// eslint-disable-next-line no-unused-vars
const logger = loggerHelper.logger({ module });

class UserService {
  getUsers(filters) {
    return userDao.find(filters);
  }

  getUserById(id) {
    return userDao.findById(id).then((user) => {
      if (_.isEmpty(user)) {
        throw new UserServiceError(
          "User not found",
          UserServiceError.ERROR_CODES.USER_NOT_FOUND,
          { payload: { id } }
        );
      }

      return user;
    });
  }

  createUser(user) {
    return userDao.find(user).then((found) => {
      found = _.head(found);
      if (!_.isEmpty(found)) {
        throw new UserServiceError(
          "Username is taken!",
          UserServiceError.ERROR_CODES.ALREADY_IN_USE
        );
      } else {
        return userDao.create(user);
      }
    });
  }

  updateUser(id, userInfos) {
    return userDao.update(id, userInfos);
  }

  deleteUser(id) {
    return userDao.findById(id).then((user) => {
      if (_.isEmpty(user)) {
        throw new UserServiceError(
          "User does not exist, cannot Delete",
          UserServiceError.ERROR_CODES.NO_SUCH_USER
        );
      }
      return userDao.delete(user);
    });
  }

  getUserByName(username) {
    return userDao.findByUsername(username).then((user) => {
      if (_.isEmpty(user)) {
        throw new UserServiceError(
          "Please register first",
          UserServiceError.ERROR_CODES.NO_SUCH_USER
        );
      }
      return user;
    });
  }
  registerUser(user) {
    return userDao.register(user);
  }
  verifyPassword(user, password) {
    return userDao.findByUsername(user.username).then((user) => {
      if (_.isEmpty(user)) {
        throw new UserServiceError(
          "Please register first",
          UserServiceError.ERROR_CODES.NO_SUCH_USER
        );
      }
      return userDao.verify(user[0].id).then((user) => {
        let result = Bcrypt.compareSync(password, user.hash);

        return result;
      });
    });
  }
  addCartItem(item) {
    return userDao.addItems(item);
  }
  removeCartItem(item) {
    return userDao.removeItems(item);
  }
  modifyCartItem(item) {
    return userDao.modifyItems(item);
  }
  loadCartItems(user) {
    return userDao.loadCartItems(user);
  }
  fetchProducts() {
    return userDao.fetchProducts();
  }
}

module.exports = new UserService();
