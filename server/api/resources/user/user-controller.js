const { createLogger } = require("bunyan");
const loggerHelper = require("../../../common/logger-helper");
const jwt = require("jsonwebtoken");
const userService = require("../../services/user/user-service");
const passportUtils = require("../../../common/passport/passport");

// eslint-disable-next-line no-unused-vars
const logger = loggerHelper.logger({ module });

class UserController {
  list(req, res, next) {
    userService
      .getUsers()
      .then((users) => {
        res.json(users);
      })
      .catch(next);
  }

  show(req, res, next) {
    userService
      .getUserById(req.params.id || req.authUser.id)
      .then((user) => {
        res.status(200).json({
          token: res.locals.token,
          user: user.username,
        });
      })
      .catch(next);
  }

  create(req, res, next) {
    userService
      .createUser(req.body)
      .then((id) => {
        res
          .status(201)
          .json(
            "Hello " + req.body.username + ", your account has been created"
          );
      })
      .catch(next);
  }

  update(req, res, next) {
    userService
      .updateUser(req.params.id, req.body)
      .then(() => res.json({ status: "ok" }))
      .catch(next);
  }

  delete(req, res, next) {
    userService
      .deleteUser(req.params.id)
      .then(() => res.json("User with id: " + req.params.id + " Deleted"))
      .catch(next);
  }

  userSearch(req, res, next) {
    userService
      .getUsers({ username: req.params.username })
      .then(_.head)
      .then((user) => {
        if (user.length > 1) {
          return res.json(
            "There are " + user.length + " users with this username"
          );
        } else {
          user = user[0];
          res.json(
            "Result user: " +
              user.username +
              " Id : " +
              user.id +
              " Full name : " +
              user.first_name +
              " " +
              user.last_name
          );
        }
      })
      .catch(next);
  }
  register(req, res, next) {
    userService
      .registerUser(req.body)
      .then((user) => res.json(user.username + " registered successfully."))
      .catch(next);
  }
  addToCart(req, res, next) {
    userService
      .addCartItem(req.body)
      .then((item) => res.json(item + " added to cart."))
      .catch(next);
  }
  removeFromCart(req, res, next) {
    userService
      .removeCartItem(req.body)
      .then((item) => res.json(item + " removed from cart."))
      .catch(next);
  }
  modifyInCart(req, res, next) {
    userService
      .modifyCartItem(req.body)
      .then((item) => res.json(item + " quantity modified."))
      .catch(next);
  }
  loadUserCart(req, res, next) {
    userService
      .loadCartItems(req.body)
      .then((response) => {
        res.json({
          items: response.item,
          qtys: response.qtyArray,
        });
      })
      .catch(next);
  }
  fetchProducts(req, res, next) {
    userService
      .fetchProducts()
      .then((products) => res.send(products))
      .catch(next);
  }
}

module.exports = new UserController();
