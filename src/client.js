"use strict";

var deferred = require("deferred"),
    Client = require("pg/lib/client"),
    Query = require("sql/lib/node/query");

// add promise and sql builder support to client
var query = Client.prototype.query;
Client.prototype.query = function() {
  var defer = deferred(),
      args = Array.prototype.slice.call(arguments),
      callback = typeof(args[args.length-1]) === "function" ? args.pop() : undefined;

  if (args[0] instanceof Query) {
    var builder = args[0].toQuery();
    args[0] = builder.text, args[1] = builder.values;
  }

  args.push(function(err, res) {
    err ? defer.reject(err) : defer.resolve(res);
  });

  query.apply(this, args);

  return defer.promise.cb(callback);
};

// fetch single row
Client.prototype.fetchOne = function() {
  var args = Array.prototype.slice.call(arguments),
      callback = typeof(args[args.length-1]) === "function" ? args.pop() : undefined;

  var promise = this.query.apply(this, args).then(function(query) {
    var res = query.rowCount > 0 ? query.rows[0] : null;
    return callback ? callback(null, res) : res;
  });

  if (callback) promise.catch(callback);

  return promise;
};

// fetch array of rows
Client.prototype.fetchAll = function() {
  var args = Array.prototype.slice.call(arguments),
      callback = typeof(args[args.length-1]) === "function" ? args.pop() : undefined;

  var promise = this.query.apply(this, args).then(function(query) {
    return callback ? callback(null, query.rows) : query.rows;
  });

  if (callback) promise.catch(callback);

  return promise;
};
