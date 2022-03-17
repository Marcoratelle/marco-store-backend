const knex = require('knex');
const VError = require('verror');
const sqlFormatter = require('sql-formatter');
const sqlString = require('sqlstring');

const loggerHelper = require('./logger-helper');

// eslint-disable-next-line no-unused-vars
const logger = loggerHelper.logger({ module });
const debug = process.env.LOG_SQL != null ? process.env.LOG_SQL === 'true' : process.env.NODE_ENV !== 'production';

function createQueryBuilder (connectionConfig) {
  const knexInstance = knex({
    client: 'pg',
    connection: connectionConfig,
    pool: {
      afterCreate: (connection, done) => {
        connection.on('error', (error) => {
          logger.error(error);
        });

        done(null, connection);
      },
      min: 0,
      max: 7,
    },
    debug: false,
  });

  if (debug) {
    knexInstance.on('query', (object) => {
      logger.debug({
        // sqlFormatter doesn't format dates properly thus why we're using sqlString on top
        sql: sqlFormatter.format(sqlString.format(object.sql, object.bindings)),
        bindings: object.bindings,
      }, 'KnexJS SQL Query');
    });
  }

  return knexInstance;
}

class QueryBuilderUtil {
  constructor () {
    this.pools = {};
    this.connectionConfigs = {
      default: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_INSTANCE == null ? process.env.DB_SERVER : `${process.env.DB_SERVER}\\${process.env.DB_INSTANCE}`,
        database: process.env.DB_NAME,
      },
    };
  }

  addConnectionConfig (name, connectionOptions) {
    this.connectionConfigs[name] = connectionOptions;
  }

  getQueryBuilder (configName = 'default') {
    if (this.connectionConfigs[configName] == null) {
      throw new VError({ info: { configName } }, 'The DB configuration name wasn\'t registered');
    }
    
    return this.pools[configName] || (this.pools[configName] = createQueryBuilder(this.connectionConfigs[configName]));
  }
}

module.exports = new QueryBuilderUtil();
