'use strict';
const sql = require('sql')
const node = require('sql/lib/node/index').prototype
const table = require('sql/lib/table').prototype

// Add convenience methods on sql builder
;['run', 'all', 'one'].forEach(function(key) {
  node[key] = function(dbal) {
    dbal = dbal || this.table.__dbal
    let query = this.toQuery()
    return dbal[key].call(dbal, query.text, query.values)
  }
})

// Add columns dynamically
table.get = table.getColumn = function(name) {
  for (let i=0; i<this.columns.length; i++) {
    let col = this.columns[i]
    if (col.property === name || col.name === name) {
      return col
    }
  }

  var add = this.createColumn(name)
  this.addColumn(add)
  
  return add
}

module.exports = sql
