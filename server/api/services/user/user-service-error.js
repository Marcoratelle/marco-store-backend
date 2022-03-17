const ServiceError = require('../../../common/service-error');

class UserServiceError extends ServiceError {
  constructor (error, message, errorCode, info) {
    super('UserServiceError', error, message, errorCode, info);
  }
}

UserServiceError.ERROR_CODES = Object.freeze({
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  NO_SUCH_USER: 'NO_SUCH_USER',
  ALREADY_IN_USE: 'ALREADY_IN_USE',
  INVALID_CREDS: 'INVALID_CREDS',
});

module.exports = UserServiceError;
