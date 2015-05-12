'use strict';
var assert = require('assert');
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
dbal.define = function(config) {
  var table = this.sql.define(config);
  table.__dbal = this;
  this.tables[config.name] = table;

  return table;
};

/**
 * Get defined sql table
 */
dbal.table = function(name) {
  assert(this.tables[name], 'Table ' + name + ' is not defined');
  return this.tables[name];
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
  });

  return promise;
};

/**
 * Disconnect pool
 */
dbal.end = function() {
  this.pg.end();
};
