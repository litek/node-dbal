var pg = require("pg"),
    table = require("./table"),
    Query = require("sql/lib/node/query"),
    deferred = require("deferred");

require("./client");

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
    var def = deferred();

    pg.connect(config, function(err, connection, release) {
      if (err) {
        def.reject(err);
      } else {
        connection.release = function() {
          delete connection.release;
          release();
        };
        def.resolve(connection);
      }
    });

    return def.promise.cb(callback);
  };

  db.transaction = function(callback) {
    var def = deferred(), client;

    db.acquire().then(function(conn) {
      client = conn;

      client.rollback = function(cb) {
        return client.query("ROLLBACK", cb);
      };

      client.commit = function(cb) {
        return client.query("COMMIT").then(function() {
          client.release();
          if (cb) cb();
        });
      };

      return client.query("BEGIN TRANSACTION");
    }).then(function(trans) {
      def.resolve(client);
    }).catch(def.reject);

    return def.promise.cb(callback);
  };

  db.query = function(query, params, callback) {
    var def = deferred();

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
      if (err) return def.reject(err);

      connection.query(query, params, function(err, res) {
        release();
        if (err) {
          def.reject(err);
        } else {
          def.resolve(res);
        }
      });
    });

    return def.promise.cb(callback);
  };

  return db;
};
