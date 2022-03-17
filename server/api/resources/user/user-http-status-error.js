const _ = require("lodash");

const loggerHelper = require("../../../common/logger-helper");

const HttpStatusError = require("../../../common/http-status-error");
const UserServiceError = require("../../services/user/user-service-error");

// eslint-disable-next-line no-unused-vars
const logger = loggerHelper.logger({ module });

class UserHttpStatusError extends HttpStatusError {
  constructor(error, i18n) {
    // merge codes
    const errorCodes = _.assign(
      {},
      UserServiceError.ERROR_CODES,
      UserHttpStatusError.ERROR_CODES
    );

    switch (HttpStatusError.getErrorCode(error)) {
      case errorCodes.USER_NOT_FOUND:
        super(error, i18n.t("user:httpErrors.USER_NOT_FOUND"), 404);
        break;
      case errorCodes.ALREADY_IN_USE:
        super(
          errorCodes.ALREADY_IN_USE,
          "Username is already taken",
          401,
          "unsure",
          "username is taken"
        );
        break;
      case errorCodes.INVALID_CREDS:
        super(
          errorCodes.INVALID_CREDS,
          "Login credentials are invalid",
          401,
          "unsure",
          "username is taken"
        );
        break;
      default:
        super(error);
        break;
    }
  }
}

UserHttpStatusError.ERROR_CODES = Object.freeze({});

module.exports = UserHttpStatusError;
