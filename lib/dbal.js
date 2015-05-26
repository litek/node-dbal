'use strict';
var Promise = require('bluebird');
var pg = require('pg');
var sql = require('./sql');
var Client = require('./client');

module.exports = dbal;

/**
 * Create new instance
 */
function dbal(url) {
  let fn = function(table) {
    return fn.table(table);
  };

  Object.keys(dbal).forEach(function(key) {
    fn[key] = dbal[key].bind(fn);
  });

  fn.url = url;
  fn.pg = pg;
  fn.sql = new sql.Sql();
  fn.tables = {};

  return fn;
}

/**
 * Define sql table
 */
dbal.define = function(config, columns) {
  if (typeof(config) === 'string') {
    config = {name: config, columns: columns || []};
  }

  var table = this.tables[config.name];

  if (!table) {
    table = this.tables[config.name] = this.sql.define(config);
    table.__dbal = this;
  } else {
    config.columns.forEach(function(col) {
      table.addColumn(col, {noisy: false});
    });
  }

  return table;
};

/**
 * Get defined sql table
 */
dbal.table = function(name) {
  return this.tables[name] || this.define(name);
};

/**
 * Acquire a standalone client
 */
dbal.client = function() {
  var parent = new this.pg.Client(this.url);
  var connect = parent.connect.bind(parent);
  return new Client(connect);
};

/**
 * Acquire a pooled client
 */
dbal.acquire = function() {
  var connect = this.pg.connect.bind(this.pg, this.url);
  return new Client(connect);
};

/**
 * Run a query, returning client directly to pool
 */
dbal.run = function(query, params, callback) {
  if (arguments.length === 2 && typeof(params) === 'function') {
    callback = params;
    params = undefined;
  }

  var client = this.acquire();
  var promise = client.run(query, params);

  promise.then(function() {
    client.end();
  }, function() {
  });

  return promise.nodeify(callback);
};

/**
 * Fetch all rows
 */
dbal.all = function(query, params, callback) {
  if (arguments.length === 2 && typeof(params) === 'function') {
    callback = params;
    params = undefined;
  }

  var promise = this.run(query, params).then(function(res) {
    return res.rows;
  });

  return promise.nodeify(callback);
};

/**
 * Fetch first row
 */
dbal.one = function(query, params, callback) {
  if (arguments.length === 2 && typeof(params) === 'function') {
    callback = params;
    params = undefined;
  }

  var promise = this.run(query, params).then(function(res) {
    return res.rows[0];
  });

  return promise.nodeify(callback);
};

/**
 * Disconnect pool
 */
dbal.end = function() {
  this.pg.end();
};
