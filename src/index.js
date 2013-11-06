var deferred = require("deferred"),
    pg = require("pg"),
    sql = require("sql");

// apply dependency modifications
require("./client");
require("./node");

module.exports = function(config) {
  return new DBAL(config);
};

var DBAL = function(config) {
  this.config = config;
  this.tables = {};
  this.models = {};
};

/**
 * Acquire connection from pool
 */
DBAL.prototype.acquire = function(callback) {
  var defer = deferred();

  pg.connect(this.config, function(err, connection, release) {
    if (err) return defer.reject(err);

    connection.release = function() {
      delete connection.release;
      release();
    };

    defer.resolve(connection);
  });

  return defer.promise.cb(callback);
};

/**
 * Run query and return client to pool
 */
DBAL.prototype.query = function(query, params, callback) {
  var client;

  if (typeof(params) === "function") {
    callback = params;
    params = [];
  }

  var promise = this
    .acquire()
    .then(function(conn) {
      client = conn;
      return client.query(query, params || []);
    })
    .then(function(query) {
      client.release();
      return callback ? callback(null, query) : query;
    })
    .catch(function(err) {
      if (client && client.release) client.release();
      if (callback) return callback(err);
      throw err;
    });

  return promise;
};

/**
 * Fetch a single row
 */
DBAL.prototype.fetchOne = function(query, params, callback) {
  var client;

  if (typeof(params) === "function") {
    callback = params;
    params = [];
  }

  var promise = this
    .query(query, params)
    .then(function(query) {
      var res = query.rowCount > 0 ? query.rows[0] : null;
      return callback ? callback(null, res) : res;
    });

  if (callback) promise.catch(callback);

  return promise;
};

/**
 * Fetch all rows as array
 */
DBAL.prototype.fetchAll = function(query, params, callback) {
  var client;

  if (typeof(params) === "function") {
    callback = params;
    params = [];
  }

  var promise = this
    .query(query, params)
    .then(function(query) {
      return callback ? callback(null, query.rows) : query.rows;
    });

  if (callback) promise.catch(callback);

  return promise;
};

/**
 * Start transaction
 */
DBAL.prototype.transaction = function(callback) {
  var promise = this
    .acquire()
    .then(function(conn) {
      client = conn;

      // convenience functions
      ["rollback", "commit"].forEach(function(name) {
        client[name] = function(cb) {
          return client.query(name.toUpperCase()).then(function() {
            client.release();
            if (cb) cb();
          });
        };
      });

      return client.query("BEGIN TRANSACTION");
    })
    .then(function() {
      return client;
    });

  if (callback) promise.catch(callback);

  return promise;
};

/**
 * Define/retrieve table
 */
DBAL.prototype.table = function(name) {
  var table;

  if (typeof(name) !== "string") {
    var config = name;
    name = config.name;

    if (typeof(this.tables[name]) !== "undefined") {
      throw new Error("Table '"+name+"' is already defined");
    }

    table = sql.define(config);
    table.__connection = this;
    this.tables[name] = table;

  } else {
    if (typeof(this.tables[name]) === "undefined") {
      throw new Error("Table '"+name+"' is undefined");
    }

    table = this.tables[name];
  }

  return table;
};
