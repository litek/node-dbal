var sql = require("sql"),
    Node = require("sql/lib/node/index");

// add run function to execute queries directly
Node.prototype.exec =
Node.prototype.execute = function(connection, callback) {
  if (!callback && connection && typeof(connection.query) !== "function") {
    callback = connection;
    connection = null;
  }

  if (!connection) {
    connection = this.table.__connection;
  }

  var query = this.toQuery(), args = [query.text, query.values];
  if (callback) args.push(callback);

  return connection.query.apply(connection, args);
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
