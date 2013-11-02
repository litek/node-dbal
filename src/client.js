var Client = require("pg/lib/client"),
    deferred = require("deferred");

var query = Client.prototype.query;
Client.prototype.query = function() {
  var defer = deferred(), args = Array.prototype.slice.call(arguments),
      callback = typeof(args[args.length-1]) === "function" ? args.pop() : undefined;

  args.push(function(err, res) {
    err ? defer.reject(err) : defer.resolve(res);
  });

  query.apply(this, args);

  return defer.promise.cb(callback);
};
