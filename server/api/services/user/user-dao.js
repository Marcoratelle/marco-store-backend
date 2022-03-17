const _ = require("lodash");
const loggerHelper = require("../../../common/logger-helper");
const queryBuilderUtils = require("../../../common/query-builder-utils");
const Bcrypt = require("bcrypt");
const { info } = require("verror");
const { json } = require("body-parser");
const saltRounds = 10;

// eslint-disable-next-line no-unused-vars
const logger = loggerHelper.logger({ module });

function jsonToArray(jsonArray) {
  let splitArray = jsonArray.split(",");
  let array = splitArray.map((x) => {
    return parseInt(x);
  });
  return array;
}

function baseUserFinderQuery(knex) {
  return knex("users").select(
    "users.id",
    "users.username",
    "users.first_name as firstName",
    "users.last_name as lastName"
  );
}

function buildUserCriteria(query, filters) {
  if (!_.isEmpty(filters)) {
    if (filters.id != null) {
      query.where("users.id", filters.id);
    }

    if (filters.username != null) {
      query.where("users.username", filters.username);
    }
  }

  return query;
}

function formatSaveUser(user) {
  return _.omitBy(
    {
      username: user.username,
      first_name: user.firstName,
      last_name: user.lastName,
    },
    _.isNil
  );
}

function formatSaveHash(hash, id) {
  return _.omitBy(
    {
      hash: hash,
      user_id: id,
    },
    _.isNil
  );
}
function formatId(id) {
  return _.omitBy(
    {
      user_id: parseInt(id),
      cart_items: null,
    },
    _.isNil
  );
}

function register(hash, id, knex = queryBuilderUtils.getQueryBuilder()) {
  formatedHash = formatSaveHash(hash, id);
  return knex("creds")
    .insert(formatedHash, "user_id")
    .then((id) => {
      formatedId = formatId(id);
      return knex("shopping_cart").insert(formatedId, "user_id");
    });
}
// *****
// NOTE: Use Mongoose's model methods naming conventions:
// http://mongoosejs.com/docs/api.html#Model
// *****
class UserDao {
  find(filters, knex = queryBuilderUtils.getQueryBuilder()) {
    const query = baseUserFinderQuery(knex);

    return buildUserCriteria(query, filters);
  }

  findById(id) {
    return this.find({ id }).then(_.head);
  }

  create(user, knex = queryBuilderUtils.getQueryBuilder()) {
    const formatedUser = formatSaveUser(user);
    const salt = Bcrypt.genSaltSync(saltRounds);
    const hash = Bcrypt.hashSync(user.password, salt);

    return knex("users")
      .insert(formatedUser, "id")
      .then((id) => {
        return register(hash, id[0]);
      });
  }

  update(id, user, knex = queryBuilderUtils.getQueryBuilder()) {
    const formatedUser = formatSaveUser(user);

    return knex("user").update(formatedUser).where("id", id);
  }

  delete(user, knex = queryBuilderUtils.getQueryBuilder()) {
    return knex("users").where("id", user.id).del();
  }

  findByUsername(username, knex = queryBuilderUtils.getQueryBuilder()) {
    return knex("users").where("username", username);
  }

  checkPassword(username, password) {
    return this.find({ username });
  }

  addItems(item, knex = queryBuilderUtils.getQueryBuilder()) {
    return knex("items")
      .where("item_name", item.item)
      .then((id) => {
        let itemId = id[0]["item_id"];
        return knex("users")
          .where("username", item.user)
          .then((userinfo) => {
            return knex("shopping_cart")
              .where("user_id", userinfo[0]["id"])
              .then((cart) => {
                let newCart = JSON.parse(cart[0]["cart_items"]);
                if (
                  newCart !== null &&
                  newCart["id"][0].indexOf(itemId) !== -1
                ) {
                  let newCartIds = jsonToArray(newCart["id"][0]);
                  let newCartQtys = jsonToArray(newCart["qty"][0]);
                  let indexId = newCartIds.indexOf(parseInt(itemId));
                  let originalQuant = parseInt(newCartQtys[indexId], 10);
                  let addedQuant = parseInt(item.amount, 10);
                  let newQuantity = null;
                  newQuantity = addedQuant + originalQuant;
                  newCartQtys[indexId] = newQuantity;
                  return knex("shopping_cart")
                    .where("user_id", userinfo[0]["id"])
                    .update({
                      cart_items:
                        '{"id":["' +
                        newCartIds +
                        '"], "qty":["' +
                        newCartQtys +
                        '"]}',
                    });
                } else {
                  return knex("shopping_cart")
                    .where("user_id", userinfo[0]["id"])
                    .then((recievedCart) => {
                      let dataRecieved = JSON.parse(
                        recievedCart[0]["cart_items"]
                      );
                      if (dataRecieved == null) {
                        let resultIds = [itemId];
                        let resultQtys = [item.amount.toString()];
                        return knex("shopping_cart")
                          .where("user_id", userinfo[0]["id"])
                          .update({
                            cart_items:
                              '{"id":["' +
                              resultIds +
                              '"], "qty":["' +
                              resultQtys +
                              '"]}',
                          });
                      }
                      let returnedCartIds = jsonToArray(dataRecieved["id"][0]);
                      let returnedCartQtys = jsonToArray(
                        dataRecieved["qty"][0]
                      );
                      if (
                        typeof returnedCartIds[0] !== "number" ||
                        typeof returnedCartQtys[0] !== "number" ||
                        isNaN(returnedCartIds[0]) !== false ||
                        isNaN(returnedCartQtys[0] !== false)
                      ) {
                        let resultIds = [itemId];
                        let resultQtys = [item.amount.toString()];
                        return knex("shopping_cart")
                          .where("user_id", userinfo[0]["id"])
                          .update({
                            cart_items:
                              '{"id":["' +
                              resultIds +
                              '"], "qty":["' +
                              resultQtys +
                              '"]}',
                          });
                      } else {
                        let dataQtys = dataRecieved["qty"];
                        let dataIds = dataRecieved["id"];
                        let resultIds = null;
                        let resultQtys = null;
                        resultIds = [...dataIds, itemId];
                        resultQtys = [...dataQtys, item.amount.toString()];
                        return knex("shopping_cart")
                          .where("user_id", userinfo[0]["id"])
                          .update({
                            cart_items:
                              '{"id":["' +
                              resultIds +
                              '"], "qty":["' +
                              resultQtys +
                              '"]}',
                          });
                      }
                    });
                }
              });
          });
      });
  }

  removeItems(item, knex = queryBuilderUtils.getQueryBuilder()) {
    return knex("items")
      .where("item_name", item.item)
      .then((id) => {
        let itemId = id[0]["item_id"];
        return knex("users")
          .where("username", item.user)
          .then((userinfo) => {
            return knex("shopping_cart")
              .where("user_id", userinfo[0]["id"])
              .then((cart) => {
                let newCart = JSON.parse(cart[0]["cart_items"]);
                if (
                  newCart !== null &&
                  newCart["id"][0].indexOf(itemId) !== -1
                ) {
                  let newCartIds = jsonToArray(newCart["id"][0]);
                  let newCartQtys = jsonToArray(newCart["qty"][0]);
                  let indexId = newCartIds.indexOf(parseInt(itemId));
                  newCartIds.splice(indexId, 1);
                  newCartQtys.splice(indexId, 1);
                  return knex("shopping_cart")
                    .where("user_id", userinfo[0]["id"])
                    .update({
                      cart_items:
                        '{"id":["' +
                        newCartIds +
                        '"], "qty":["' +
                        newCartQtys +
                        '"]}',
                    });
                } else {
                  return;
                }
              });
          });
      });
  }

  modifyItems(item, knex = queryBuilderUtils.getQueryBuilder()) {
    return knex("items")
      .where("item_name", item.item)

      .then((id) => {
        let itemId = id[0]["item_id"];
        return knex("users")
          .where("username", item.user)

          .then((userinfo) => {
            return knex("shopping_cart")
              .where("user_id", userinfo[0]["id"])

              .then((cart) => {
                let newCart = JSON.parse(cart[0]["cart_items"]);

                if (
                  newCart !== null &&
                  newCart["id"][0].indexOf(itemId) !== -1
                ) {
                  let newCartIds = jsonToArray(newCart["id"][0]);
                  let newCartQtys = jsonToArray(newCart["qty"][0]);
                  let indexId = newCartIds.indexOf(parseInt(itemId));
                  newCartQtys[indexId] = item.amount;
                  return knex("shopping_cart")
                    .where("user_id", userinfo[0]["id"])
                    .update({
                      cart_items:
                        '{"id":["' +
                        newCartIds +
                        '"], "qty":["' +
                        newCartQtys +
                        '"]}',
                    });
                }
              });
          });
      });
  }

  loadCartItems(user, knex = queryBuilderUtils.getQueryBuilder()) {
    let username = user.user;
    return knex("users")
      .where("username", username)

      .then((userinfo) => {
        return knex("shopping_cart")
          .where("user_id", userinfo[0]["id"])

          .then((cart) => {
            let parsedCart = JSON.parse(cart[0]["cart_items"]);
            let idArray = jsonToArray(parsedCart["id"][0]);
            let qtyArray = jsonToArray(parsedCart["qty"][0]);

            return Promise.all(
              idArray.map((id) => knex("items").where("item_id", id))
            ).then((item) => {
              let results = { item, qtyArray };
              return results;
            });
          });
      });
  }

  fetchProducts(knex = queryBuilderUtils.getQueryBuilder()) {
    return knex("items").then((result) => {
      return result;
    });
  }
  //  verify(id, knex = queryBuilderUtils.getQueryBuilder()) {
  //  return knex('hash')
  //    .where('id', id)
  //    .then(_.head);
  //  }
}

module.exports = new UserDao();
