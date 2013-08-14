var pg = require("pg"),
    table = require("./table"),
    Query = require("../node_modules/sql/lib/node/query");

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
    pg.connect(config, callback);
  };

  db.query = function(query, params, callback) {
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
      if (err) return callback(err);

      connection.query(query, params, function(err, res) {
        release();
        callback(err, res);
      });
    });
  };

  return db;
};
