'use strict';
var sql = require('sql');
var node = require('sql/lib/node/index').prototype;

module.exports = sql;

['run', 'all', 'one'].forEach(function(key) {
  node[key] = function(dbal) {
    dbal = dbal || this.table.__dbal;
    return dbal[key].call(dbal, this);
  };
});
