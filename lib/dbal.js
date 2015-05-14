'use strict';
var Promise = require('bluebird');
var pg = require('pg');
var sql = require('./sql');
var Client = require('./client');

module.exports = Dbal;

var dbal = Dbal.prototype;

/**
 * Create new instance
 */
function Dbal(url) {
  if (!(this instanceof Dbal)) {
    return new Dbal(url);
  }

  this.url = url;
  this.pg = pg;
  this.sql = new sql.Sql();
  this.tables = {};
}

/**
 * Define sql table
 */
dbal.define = function(config, columns) {
  if (arguments.length === 2) {
    config = {name: config, columns: columns};
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
  return this.tables[name] || this.define({name: name, columns: []});
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
dbal.run = function(query, params) {
  var client = this.acquire();
  var promise = client.run(query, params);

  promise.then(function() {
    client.end();
  }, function() {});

  return promise;
};

/**
 * Fetch all rows
 */
dbal.all = function(query, params) {
  return this.run(query, params).then(function(res) {
    return res.rows;
  });
};

/**
 * Fetch first row
 */
dbal.one = function(query, params) {
  return this.run(query, params).then(function(res) {
    return res.rows[0];
  });
};

/**
 * Disconnect pool
 */
dbal.end = function() {
  this.pg.end();
};
