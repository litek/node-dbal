"use strict";

var Node = require("sql/lib/node/index"),
    Table = require("sql/lib/table");

// execute query directly
Node.prototype.query = function(connection, callback) {
  if (!callback && connection && typeof(connection.query) !== "function") {
    callback = connection;
    connection = null;
  }

  if (!connection) {
    connection = this.table.__connection;
  }

  var args = [this];
  if (callback) args.push(callback);

  return connection.query.apply(connection, args);
};

// fetch single row
Node.prototype.fetchOne = function(connection, callback) {
  var promise = this.query(connection).then(function(query) {
    var res = query.rowCount > 0 ? query.rows[0] : null;
    return callback ? callback(null, res) : res;
  });

  if (callback) promise.catch(callback);

  return promise;
};

// fetch rows array
Node.prototype.fetchAll = function(connection, callback) {
  var promise = this.query(connection).then(function(query) {
    return callback ? callback(null, query.rows) : query.rows;
  });

  if (callback) promise.catch(callback);

  return promise;
};
