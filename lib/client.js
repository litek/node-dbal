'use strict';
var assert = require('assert');

module.exports = Client;

var client = Client.prototype;

/**
 * Create new client instance with connection callback
 */
function Client(connect) {
  var self = this;

  this.connect = function() {
    return new Promise(function(resolve, reject) {
      if (self.connection) return resolve(self.connection);

      connect(function(err, res, done) {
        if (err) return reject(err);
        self.connection = res;
        self.end = function() {
          self.connection = undefined;
          done ? done() : res.end();
        };

        return resolve(res);
      });
    });
  };
}

/**
 * Acquire connection and send raw query returning a promise
 */
client.raw = function(query, params) {
  if (typeof(query.toQuery) === 'function') {
    var obj = query.toQuery();
    query = obj.text;
    params = obj.values;
  }

  return this.connect().then(function(connection) {
    return new Promise(function(resolve, reject) {
      connection.query(query, params, function(err, res) {
        return err ? reject(err) : resolve(res);
      });
    });
  });
};

/** 
 * Begin transaction
 */
client.begin = function() {
  return client.raw('BEGIN');
};

/**
 * Commit transaction
 */
client.commit = function() {
  return client.raw('COMMIT');
};

/**
 * Run query returning promise helpers
 */
client.run = function(query, params) {
  var promise = this.raw(query, params);

  promise.all = function() {
    return promise.then(function(res) {
      return res.rows;
    });
  };

  promise.one = function() {
    return promise.then(function(res) {
      return res.rows[0];
    });
  };

  return promise;
};
