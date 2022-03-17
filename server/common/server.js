const Express = require('express');
const path = require('path');
const config = require('config');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const os = require('os');
const helmet = require('helmet');
const createRequestLogger = require('bunyan-request-logger');
const cors = require('cors');

const loggerHelper = require('./logger-helper');
const queryBuilderUtils = require('./query-builder-utils');

const swaggerify = require('./swagger');
const errorHandler = require('./error-handler');

const logger = loggerHelper.logger({ module });
const app = new Express();

module.exports = class ExpressServer {
  constructor () {
    if (process.env.LOG_REQUESTS && process.env.LOG_REQUESTS === 'true') {
      app.use(createRequestLogger(loggerHelper.options).requestLogger());
    }

    app.use(helmet());
    app.use(cors({
      origin: config.get('security.cors'),
    }));

    app.use(cookieParser());

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(Express.static(path.join(process.cwd(), 'public')));
  }

  configureDbPools () {
    queryBuilderUtils.addConnectionConfig('TODO', {
      user: process.env.TODO_DB_USER,
      password: process.env.TODO_DB_PASSWORD,
      server: `${process.env.TODO_DB_SERVER}\\${process.env.TODO_DB_INSTANCE}`,
      database: process.env.TODO_DB_NAME,
    });
  }

  swaggerify () {
    swaggerify(app);
  }

  bindRoutes (routes) {
    routes(app);
  }

  bindErrorHandler () {
    app.use(errorHandler.preProcessingMiddleware);
    app.use(errorHandler.handlerMiddleware);
  }

  listen (port = process.env.PORT) {
    let server;

    return new Promise((resolve) => {
      server = app.listen(port, () => {
        logger.info({
          running_mode: process.env.NODE_ENV || 'development',
          host_name: os.hostname(),
          port,
        }, 'Server up and running');

        resolve(server);
      });

      // graceful shutdown
      process.on('SIGTERM', () => {
        server.close(() => process.exit(0));
      });
    });
  }
};
