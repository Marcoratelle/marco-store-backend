require('./server/common/env');

const server = process.env.DB_INSTANCE == null ? process.env.DB_SERVER : `${process.env.DB_SERVER}\\${process.env.DB_INSTANCE}`;
const mssqlConfigs = {
  client: 'postgres',
  connection: {
    user: process.env.DB_USER_MIGRATION,
    password: process.env.DB_PASSWORD_MIGRATION,
    server,
    database: process.env.DB_NAME,
  },
  pool: { min: 0, max: 7 },
  migrations: {
    tableName: 'migrations',
    directory: './db/migrations',
  },
  seeds: {
    directory: './db/seeds/development',
  },
  debug: true,
  disableTransactions: true,
};

module.exports = {
  development: mssqlConfigs,
  production: mssqlConfigs,
};
