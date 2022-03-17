const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
class PassportUtils {
  verify(username) {
    const user = { name: username };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    return res.json({ accessToken });
  }
}
module.exports = new PassportUtils();
