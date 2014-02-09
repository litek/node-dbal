"use strict";
var promise = require("bluebird"),
    pg = require("pg"),
    sql = require("sql"),
    Node = require("sql/lib/node/index"),
    DBAL = function() {};

/**
 * Create new DBAL object
 *
 * @param {string} config
 */
module.exports = function(config) {
  var obj = function(table) {
    return obj.table(table);
  };

  obj.__proto__ = DBAL.prototype;
  obj.config = config;
  obj.tables = {};
  return obj;
};

/**
 * Run query and return connection to pool
 *
 * @param {(string|Query)} query
 * @param {array} [params]
 * @param {function} [cb]
 */
DBAL.prototype.query = function(query, params, cb) {
  var defer = promise.defer();

  if (query instanceof Node) {
    var obj = query.toQuery();
    query = obj.text;
    params = obj.values;
  } else if (!params) {
    params = [];
  } else if (typeof(params) === "function") {
    cb = params;
    params = [];
  }

  pg.connect(this.config, function(err, client, done) {
    if (err) {
      done();
      return defer.reject(err);
    }

    client.query(query, params, function(err, res) {
      done();
      if (err) return defer.reject(err);
      defer.resolve(res);
    });
  });

  return defer.promise.nodeify(cb);
};

/**
 * Get transaction
 */
DBAL.prototype.transaction = function(cb) {
  var defer = promise.defer();

  pg.connect(this.config, function(err, client, done) {
    client.release = done;

    client.commit = function() {
      return client.query("COMMIT").then(function(res) {
        client.release();
        return res;
      });
    };

    client.rollback = function() {
      return client.query("ROLLBACK").then(function(res) {
        client.release();
        return res;
      });
    };

    client.query = promise.promisify(client.query, client);

    defer.resolve(client);
  });

  return defer.promise.nodeify(cb);
};

/**
 * Define/retrieve table
 *
 * @param {string|object} config
 */
DBAL.prototype.table = function(config) {
  var table, name;

  if (typeof(config) !== "string") {
    name = config.name;

    if (typeof(this.tables[name]) !== "undefined") {
      throw new Error("Table '"+name+"' is already defined");
    }

    table = sql.define(config);
    table.__dbal = this;
    this.tables[name] = table;

  } else {
    name = config;

    if (typeof(this.tables[name]) === "undefined") {
      throw new Error("Table '"+name+"' is undefined");
    }

    table = this.tables[name];
  }

  return table;
};

/**
 * Execute query directly from Node
 *
 * @param {DBAL} [dbal]
 * @param {function} [cb]
 */
var cls = require("pg/lib/client");
Node.prototype.exec = function(dbal, cb) {
  if (!cb && dbal && !(dbal instanceof DBAL) && !(dbal instanceof cls)) {
    cb = dbal;
    dbal = undefined;
  }

  if (!dbal) {
    dbal = this.table.__dbal;
  }

  var q = this.toQuery();
  return dbal.query(q.text, q.values, cb);
};
