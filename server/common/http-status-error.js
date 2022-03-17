// See https://github.com/joyent/node-verror
const { VError } = require('verror');
const _ = require('lodash');

const loggerHelper = require('./logger-helper');

// eslint-disable-next-line no-unused-vars
const logger = loggerHelper.logger({ module });

class HttpStatusError extends VError {
  constructor (error, message = 'Internal Server Error', httpStatusCode = 500, appStatusCode = 'AD003') {
    let cause;

    if (!_.isString(error)) {
      cause = error;
    }

    super({
      name: 'HttpStatusError',
      cause,
      info: {
        httpStatusCode,
        appStatusCode,
      },
    }, message);

    // This is used bu the `express-error-handler` module
    this.status = httpStatusCode;
  }
}

HttpStatusError.getErrorCode = (error) => {
  let code;

  if (_.isString(error)) {
    code = error;
  } else {
    // eslint-disable-next-line no-use-before-define
    const info = HttpStatusError.info(error);
    code = info && info.errorCode;
  }

  return code;
};

module.exports = HttpStatusError;
