'use strict';
var Node = require('sql/lib/node/index');

['run', 'one', 'all'].forEach(function(key) {
  Node.prototype[key] = function(dbal) {
    dbal = dbal || this.table.__dbal;
    return dbal[key].call(dbal, this);
  };
});

module.exports = Node;
