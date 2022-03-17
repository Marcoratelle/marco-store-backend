const Bcrypt = require("bcrypt");
const _ = require("lodash");
const UserServiceError = require("../../api/services/user/user-service-error");
const loggerHelper = require("../logger-helper");
const queryBuilderUtils = require("../query-builder-utils");

// eslint-disable-next-line no-unused-vars
const logger = loggerHelper.logger({ module });

const getUser = (username, knex = queryBuilderUtils.getQueryBuilder()) =>
  knex("users").where({ username }).then(_.head);

const getHash = (user_id, knex = queryBuilderUtils.getQueryBuilder()) =>
  knex("creds").where({ user_id }).then(_.head);

const authenticateMiddleware = (req, res, next) => {
  const { username, password } = req.body;

  return getUser(username)
    .then((user) => {
      if (user) {
        getHash(user.id)
          .then((creds) => Bcrypt.compare(password, creds.hash))

          .then((isValid) => {
            if (isValid) {
              req.authUser = user;
              next();
            } else {
              throw new UserServiceError(
                "Invalid user credentials",
                UserServiceError.ERROR_CODES.INVALID_CREDS
              );
            }
          })
          .catch(next);
      } else {
        throw new UserServiceError(
          "Invalid user credentials",
          UserServiceError.ERROR_CODES.INVALID_CREDS
        );
      }
    })

    .catch(next);
};

module.exports = authenticateMiddleware;
