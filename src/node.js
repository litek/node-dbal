"use strict";
var Node = require("sql/lib/node/index");

// execute query directly
Node.prototype.exec = function(dbal, cb) {
  var query = this.toQuery();

  if (!cb && dbal && typeof(dbal.query) !== "function") {
    cb = dbal;
    dbal = undefined;
  }

  if (!dbal) {
    dbal = this.table.__dbal;
  }

  return dbal.query(query.text, query.params, cb);
};
