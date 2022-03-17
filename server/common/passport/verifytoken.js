const config = require("config");
const _ = require("lodash");
const jwt = require("jsonwebtoken");

const verifyAsync = (token) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, content) => {
      if (error) {
        reject(error);
      }

      resolve(content);
    });
  });

//api key must be in payload, this is for testing:  "apikey": "1jh23b3k1jh2b321k2hb31h2j3"

const valideApiKeyMiddleware = (req, res, next) => {
  const { token } = req.headers;
  return verifyAsync(token)
    .then((content) => _.get(content, "apikey"))
    .then((apikey) => {
      if (apikey !== config.get("apikey.test")) {
        res.sendStatus(401);
      } else {
        next();
      }
    })
    .catch((error) => res.sendStatus(401));
};

module.exports = valideApiKeyMiddleware;
