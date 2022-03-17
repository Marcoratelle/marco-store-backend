const { VError } = require('verror');
const _ = require('lodash');

class ServiceError extends VError {
  constructor (name, error, message, errorCode, info = {}) {
    let cause;

    // if no root cause error is passed
    if (_.isString(error)) {
      info = errorCode || {};
      errorCode = message;
      message = error;
      error = null;
    }

    if (error != null) {
      cause = error;
    }

    info.errorCode = errorCode;

    super({
      name,
      cause,
      info,
    }, message);
  }
}

module.exports = ServiceError;
