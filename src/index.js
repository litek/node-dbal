'use strict';
var Promise = require('bluebird');
var Sql = require('sql').Sql;
var pg = require('pg');
var Client = require('./client');

var Dbal = function(url) {
  if (!(this instanceof Dbal)) {
    return new Dbal(url);
  }

  this.url = url;
  this.pg = pg;
  this.sql = new Sql();
  this.tables = {};
};

// @todo Useful helper function, but should it be somewhere else?
Dbal.prototype.generate = function(schema) {
  var database = this.url.match(/[^\/]+$/)[0];
  schema = schema || 'public';

  var dbal = this, client;
  return dbal.client().then(function(res) {
    client = res;
    return client.all(
      'SELECT table_name AS name, json_agg(column_name) AS columns ' +
      'FROM information_schema.columns ' +
      'WHERE table_catalog = $1 AND table_schema = $2 GROUP BY table_name',
      [database, schema]
    );

  }).then(function(res) {
    client.done();
    res.map(dbal.define, dbal);

    // definitions are mutated when defined, just making sure they're minimal
    return res.map(function(row) {
      return {name: row.name, columns: row.columns};
    });
  });
};

Dbal.prototype.define = function(config) {
  var table = this.sql.define(config);
  table.__dbal = this;
  this.tables[config.name] = table;

  return table;
};

Dbal.prototype.table = function(name) {
  return this.tables[name];
};

Dbal.prototype.client = function() {
  var connection = new this.pg.Client(this.url);

  return new Promise(function(resolve, reject) {
    connection.connect(function(err) {
      if (err) {
        // @todo Check if we should end the client
        // connection.end();
        return reject(err);
      }

      var client = new Client(connection, connection.end.bind(connection));
      return resolve(client);
    });
  });
};

Dbal.prototype.acquire = function() {
  var self = this;

  return new Promise(function(resolve, reject) {
    pg.connect(self.url, function(err, connection, done) {
      if (err) {
        done();
        return reject(err);
      }

      var client = new Client(connection, done);
      return resolve(client);
    });
  });
};

Dbal.prototype.transaction = function() {
  var client;

  return this.acquire().then(function(res) {
    client = res;
    return client.begin();
  }).then(function() {
    return client;
  });
};

['run', 'one', 'all'].forEach(function(key) {
  Dbal.prototype[key] = function() {
    var args = [].slice.call(arguments);
    var client;

    return this.acquire().then(function(res) {
      client = res;
      return client[key].apply(client, args);

    }).then(function(res) {
      client.done();
      return res;
    });
  };
});

module.exports = Dbal;
