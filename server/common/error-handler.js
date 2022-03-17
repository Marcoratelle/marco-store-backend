const createErrorHandler = require('express-error-handler');
const { VError } = require('verror');

const loggerHelper = require('./logger-helper');

// eslint-disable-next-line no-unused-vars
const logger = loggerHelper.logger({ module });
const systemErrorStatusCodeRegex = /[^1-4]\d\d/;

const handlerMiddleware = createErrorHandler({
  // prevent shutdown on error by passing a noop function
  shutdown: () => {},
  serializer: (error) => {
    const info = VError.info(error);

    return {
      message: error.message,
      info,
    };
  },
  framework: 'express',
});

function preProcessingMiddleware (err, req, res, next) {
  // this middleware will be hit first, thus setting the pivotal flag
  // on the error object so it's accessible in the serializer function
  // in the handler above
  const info = VError.info(err);

  if ((info && info.appStatusCode) == null || systemErrorStatusCodeRegex.test(info.httpStatusCode)) {
    logger.error({
      err,
      authUser: req.authUser,
    });
  }

  next(err);
}

module.exports = {
  preProcessingMiddleware,
  handlerMiddleware,
};
