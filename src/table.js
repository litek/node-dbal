var sql = require("sql"),
    Node = require("../node_modules/sql/lib/node/index");

// add run function to execute queries directly
Node.prototype.run = function(callback) {
  this.table.__connection.query(this, callback);
};

// dynamically add columns to query builder
sql.Table.prototype.get = 
sql.Table.prototype.getColumn = function(colName) {
  var col;

  for(var i = 0; i < this.columns.length; i++) {
    col = this.columns[i];
    if(col.name == colName) {
      return col;
    }
  }

  // create non-existant column
  col = this.createColumn(colName);
  this.addColumn(col);

  return col;
};

// create table node
module.exports = function(connection, name, columns) {
  var table = sql.define({
    name: name,
    columns: columns || []
  });

  table.__connection = connection;

  return table;
};
