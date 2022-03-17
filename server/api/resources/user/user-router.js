const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const loggerHelper = require("../../../common/logger-helper");

const authenticateMiddleware = require("../../../common/passport/auth");
const valideApiKeyMiddleware = require("../../../common/passport/verifytoken");
const signTokenMiddleware = require("../../../common/passport/token");
const userController = require("./user-controller");
const UserHttpStatusError = require("./user-http-status-error");

// eslint-disable-next-line no-unused-vars
const logger = loggerHelper.logger({ module });

module.exports.prefix = "users/";

function handleError(error, req, res, next) {
  switch (error.constructor.name) {
    case "UserHttpStatusError":
      next(error);
      break;
    default:
      next(new UserHttpStatusError(error, req.i18n));
  }
}

/**
 * Using a wrapping function instead of something like
 * `.get('/:id', controller.show.bind(controller))` which makes the usage
 * of stubs and spies impossible in tests
 */
function wrapFnCall(fnName, controller) {
  return (...args) => controller[fnName](...args);
}
// valideApiKeyMiddleware middleware to read token

// See https://expressjs.com/en/guide/routing.html for more info on express'
// router.
module.exports.router = express.Router({ mergeParams: true })
  .post('/search/:username', wrapFnCall('userSearch', userController))
  .post('/login', authenticateMiddleware, signTokenMiddleware, wrapFnCall('show', userController))
  .post('/shoppingCart/addToCart',wrapFnCall('addToCart',userController))
  .post('/shoppingCart/removeFromCart',wrapFnCall('removeFromCart',userController))
  .post('/shoppingCart/modifyInCart',wrapFnCall('modifyInCart',userController))
  .get('/',valideApiKeyMiddleware, wrapFnCall('list', userController))
  .get('/fetchProducts',wrapFnCall('fetchProducts',userController))
  .post('/retrieveUserCart',wrapFnCall('loadUserCart',userController))
  .post('/register', wrapFnCall('create', userController))
  .get('/:id',valideApiKeyMiddleware, wrapFnCall('show', userController))
  .put('/:id',valideApiKeyMiddleware, wrapFnCall('update', userController))
  .delete('/:id',valideApiKeyMiddleware, wrapFnCall('delete',userController))
  
  .use(handleError);