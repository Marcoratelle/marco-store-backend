const dotenv = require('dotenv');
const joi = require('joi');

const vars = dotenv.config().parsed;

const envVarsSchema = joi.object({
  ACCESS_TOKEN_SECRET: joi.string(),
  REFRESH_TOKEN_SECRET: joi.string(),
  NODE_ENV: joi.string(),
  APP_ID: joi.string()
    .required(),
  PORT: joi.number()
    .required(),
  LOG_LEVEL: joi.string()
    .allow(['error', 'warn', 'info', 'verbose', 'debug', 'silly'])
    .required(),
  LOGS_PRETTY_FORMAT: joi.boolean(),
  SWAGGER_API_DOCS_ROOT: joi.string()
    .required(),
  LOG_REQUESTS: joi.string(),
  SERVICES_IP: joi.alternatives().try(
    joi.string().hostname(),
    joi.string().ip()).required(),
  DB_USER: joi.string()
    .required(),
  DB_PASSWORD: joi.string()
    .required(),
  DB_SERVER: joi.string()
    .required(),
  DB_INSTANCE: joi.alternatives()
    .when('NODE_ENV', {
      is: 'production',
      then: joi.string().required(),
      otherwise: joi.string(),
    }),
  DB_NAME: joi.string()
    .required(),
  DB_USER_MIGRATION: joi.string()
    .required(),
  DB_PASSWORD_MIGRATION: joi.string()
    .required(),
}).required();

let validationRes;

if (vars != null) {
  validationRes = joi.validate(vars, envVarsSchema, { allowUnknown: false });
  if (validationRes.error) {
    validationRes.error.message = validationRes.error.message.replace(/is not allowed/g, 'is missing');
  }
} else {
  validationRes = joi.validate(process.env, envVarsSchema, { allowUnknown: true });
}

if (validationRes.error) {
  throw new Error(`Environment variables validation error: ${validationRes.error.message}`);
}
