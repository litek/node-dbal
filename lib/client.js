'use strict';
// var Promise = require('bluebird');

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
 * Acquire connection and send query returning a promise
 */
client.run = function(query, params) {
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
 * Fetch all rows
 */
client.all = function(query, params) {
  return this.run(query, params).then(function(res) {
    return res.rows;
  });
};

/**
 * Fetch first row
 */
client.one = function(query, params) {
  return this.run(query, params).then(function(res) {
    return res.rows[0];
  });
};

/** 
 * Begin transaction
 */
client.begin = function() {
  return client.run('BEGIN');
};

/**
 * Commit transaction
 */
client.commit = function() {
  return client.run('COMMIT');
};
