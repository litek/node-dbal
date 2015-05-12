'use strict';
var sql = require('sql');
var node = require('sql/lib/node/index').prototype;

module.exports = sql;

node.run = function(dbal) {
  dbal = dbal || this.table.__dbal;
  return dbal.run.call(dbal, this);
};
