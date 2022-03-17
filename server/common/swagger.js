/**
 * NOTE: Keeping swagger-express-middleware for backward validation compatibility
 * It should be replaced by either https://github.com/gargol/swagger-express-validator or https://github.com/apigee-127/swagger-tools
 */
const swaggerUi = require('swagger-ui-express');
const swaggerMiddleware = require('swagger-express-middleware');
const refParser = require('json-schema-ref-parser');
const path = require('path');

const cachedSchemas = {};
const loadJsonSchema = (rootDataRelativePath, schemaFileName, cacheSchema = true) => {
  // Need to use the relative path to the module's dir since we can be in src/ or dist/...
  const fullDataPath = path.resolve(process.cwd(), rootDataRelativePath, schemaFileName);
  let promise;

  if (cachedSchemas[fullDataPath] != null) {
    promise = cachedSchemas[fullDataPath];
  } else {
    promise = refParser.dereference(fullDataPath, schemaFileName, {}).then((schema) => {
      if (cacheSchema) {
        cachedSchemas[fullDataPath] = Promise.resolve(schema);
      }

      return schema;
    });
  }

  return promise;
};

// NOTE: swaggerUI overrides the global Promise object
// Overriding it again
global.Promise = require('bluebird');

module.exports = app =>
  loadJsonSchema(path.join(process.cwd(), 'config', 'swagger'), 'api.yaml')
    .then(swaggerDocument => new Promise((resolve, reject) => {
      swaggerMiddleware(swaggerDocument, app, (err, middleware) => {
        if (err) {
          reject(err);
        } else {
          app.use(middleware.metadata());
          app.use(middleware.parseRequest({
            // Configure the cookie parser to use secure cookies
            cookie: { secret: process.env.SESSION_SECRET },
            json: { limit: process.env.REQUEST_LIMIT },
          }));

          // These two middleware don't have any options (yet)
          app.use(
            middleware.CORS(),
            // https://github.com/BigstickCarpet/swagger-express-middleware/blob/master/docs/middleware/validateRequest.md
            middleware.validateRequest()
          );

          if (process.env.NODE_TESTS_RUNNING !== 'true') {
            app.use(`${process.env.SWAGGER_API_DOCS_ROOT}`, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
          }

          resolve();
        }
      });
    }));
