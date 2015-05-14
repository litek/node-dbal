'use strict';
var sql = require('sql');
var node = require('sql/lib/node/index').prototype;
var table = require('sql/lib/table').prototype;

module.exports = sql;

['run', 'all', 'one'].forEach(function(key) {
  node[key] = function(dbal) {
    dbal = dbal || this.table.__dbal;
    return dbal[key].call(dbal, this);
  };
});

table.get = table.getColumn = function(name) {
  for (var i=0; i<this.columns.length; i++) {
    var col = this.columns[i];
    if (col.property === name || col.name === name) {
      return col;
    }
  }

  var add = this.createColumn(name);
  this.addColumn(add);
  
  return add;
};
