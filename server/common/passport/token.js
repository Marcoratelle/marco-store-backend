const config = require("config");
const _ = require("lodash");
const jwt = require("jsonwebtoken");

const loggerHelper = require("../logger-helper");
const { userSearch } = require("../../api/resources/user/user-controller");

// eslint-disable-next-line no-unused-vars
const logger = loggerHelper.logger({ module });

// const verifyAsync = token =>
//   new Promise((resolve, reject) => {
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, content) => {
//         if (error) {
//             reject(error);
//         }

//         resolve(content);
//     });
//   });

//api key must be in payload, this is for testing:  "apikey": "1jh23b3k1jh2b321k2hb31h2j3"
// const valideApiKeyMiddleware = (req, res, next) => {
//     const { token } = req.headers;
//     return verifyAsync(token)
//         .then(content => _.get(content, 'apikey'))
//         .then((apikey) => {
//             if (apikey !== config.get('apikey.test')) {
//                 res.sendStatus(401);
//             } else {
//                 next();
//             }
//         }).catch(error => res.sendStatus(401));
// };

const signTokenMiddleware = (req, res, next) => {
  const data = req.body.username;
  //logger.debug(req.body)
  const token = jwt.sign({ data }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  res.locals.token = token;
  next();
};

module.exports = signTokenMiddleware;
