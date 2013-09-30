var pg = require("pg"),
    table = require("./table"),
    Query = require("../node_modules/sql/lib/node/query"),
    Q = require("q");

module.exports = function(config) {
  var tables = {};

  // return new sql builder for table
  var db = function(name, columns) {
    if (typeof(tables[name]) === "undefined") {
      tables[name] = table(db, name, columns);
    } else if (typeof(columns) !== "undefined") {
      throw new Error("Table " + name + " has already been defined");
    }

    return tables[name];
  };

  db.acquire = function(callback) {
    var deferred = Q.defer();

    pg.connect(config, function(err, connection, release) {
      if (err) {
        deferred.reject(err);
      } else {
        connection.release = function() {
          delete connection.release;
          release();
        };
        deferred.resolve(connection);
      }
    });

    return deferred.promise.nodeify(callback);
  };

  db.query = function(query, params, callback) {
    var deferred = Q.defer();

    if (typeof(params) === "function") {
      callback = params;
      params = [];
    }

    if (query instanceof Query) {
      var extract = query.toQuery();
      query = extract.text;
      params = extract.values;
    }

    pg.connect(config, function(err, connection, release) {
      if (err) return deferred.reject(err);

      connection.query(query, params, function(err, res) {
        release();
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(res);
        }
      });
    });

    return deferred.promise.nodeify(callback);
  };

  return db;
};
