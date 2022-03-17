const _ = require('lodash');

const Server = require('./common/server');
const routes = require('./routes');

const loggerHelper = require('./common/logger-helper');

const logger = loggerHelper.logger({ module });
const server = new Server();

const overPromises = (promiseFnArray, args = []) => {
  return Promise.each(promiseFnArray, item =>
    (_.isFunction(item) ? item(...args) : item));
};

module.exports = overPromises([
  () => server.configureDbPools(),
  () => server.bindRoutes.call(server, routes),
  () => server.swaggerify(),
  () => server.bindErrorHandler(),
])
  .then(() => server.listen.call(server, process.env.PORT))
  .catch((error) => {
    logger.error(error);
    throw error;
  });
