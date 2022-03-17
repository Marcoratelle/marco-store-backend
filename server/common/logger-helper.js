const bunyan = require('bunyan');
const path = require('path');
const _ = require('lodash');
const VError = require('verror');

let appName = 'unknowAppName';

try {
  // eslint-disable-next-line
  appName = require(`${process.cwd()}/package.json`).name;
} catch (error) {
  // package.json can't be found
}

/**
 * Converts objects with key 'user'
 * @param  {Object} user a user model instance
 * @return {Object}            a sanitized user instance
 */
function hidePasswordFields (user) {
  const passwdKeys = ['password', 'passwd', 'pwd', 'userPassword', 'userPasswd', 'userPwd'];

  if ((user != null) && !_.isString(user)) {
    user = _.cloneDeep(user);

    _.forEach(passwdKeys, (passwdKey) => {
      if (user[passwdKey] != null) {
        user[passwdKey] = _.pad('', user[passwdKey].length, '*');
      }
    });
  }

  return user;
}

/**
 * Converts objects with key 'req'
 * @param  {Object} req the http request object
 * @return {Object}     the sanitized request object
 */
function reqSerializer (req) {
  if (_.get(req, 'connection') || _.get(req, 'headers')) {
    req = {
      language: req.language,
      languages: req.languages,
      headers: req.headers,
      method: req.method,
      url: req.url,
      params: req.params,
      body: hidePasswordFields(req.body),
    };

    _.assign(req, hidePasswordFields(req.user || req.authUser || req.creds));
  }

  return req;
}

function resSerializer (res) {
  if (res && res.statusCode) {
    res = {
      statusCode: res.statusCode,
      header: res._header,
      text: _.truncate(res.text, { length: 3000 }),
    };
  }

  return res;
}

/**
 * Converts a module object to its filename
 * @param  {Object} module a module instance
 * @return {String}        the module's filename
 */
function moduleSerializer (module) {
  if (_.get(module, 'filename')) {
    module = path.basename(module.filename);
  } else {
    module = null;
  }

  return module;
}

function errorSerializer (error) {
  const errorLog = bunyan.stdSerializers.err(error);

  if (_.isError(error)) {
    errorLog.info = VError.info(error);
  }

  return errorLog;
}

const serializers = {
  module: moduleSerializer,
  req: reqSerializer,
  res: resSerializer,
  user: hidePasswordFields,
  attributes: hidePasswordFields,
  body: hidePasswordFields,
  err: errorSerializer,
  error: errorSerializer,
};

const options = {
  name: process.env.APP_ID || appName,
  serializers,
  level: process.env.LOG_LEVEL || 'debug',
  stream: process.stdout,
};

const defaultLogger = bunyan.createLogger(options);
const bunyanEmit = bunyan.prototype._emit;

// Monkey patch logger in order to have the
// transaction ID logged at all times
bunyan.prototype._emit = (rec, noemit) => {
  bunyanEmit.call(defaultLogger, rec, noemit);
};

process.on('uncaughtException', (err) => {
  if (defaultLogger != null) {
    defaultLogger.error(err, '\u2622 UncaughtException \u2622');
    // eslint-disable-next-line no-console
    console.error(err.message);
  } else {
    // eslint-disable-next-line no-console
    console.error(`\u2622 UncaughtException \u2622: ${err.message}`);
    // eslint-disable-next-line no-console
    console.error(err.stack);
  }

  return process.exit(1);
});

function logger (properties = null) {
  return properties ? defaultLogger.child(properties) : defaultLogger;
}

module.exports = {
  logger,
  options,
};
