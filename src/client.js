'use strict';
var Node = require('./node');
var Promise = require('bluebird');
var result = require('./result');

var Client = function(connection, done) {
  this.connection = connection;
  this._done = done;
};

Client.prototype.done = function() {
  var self = this;
  this._done();

  Object.keys(Client.prototype).forEach(function(key) {
    self[key] = function() {
      throw new Error('Client connection has been disconnected or returned to pool');
    };
  });
};

Client.prototype.begin = function() {
  return this.run('BEGIN');
};

Client.prototype.commit = function() {
  return this.run('COMMIT');
};

Client.prototype.rollback = function(point) {
  var q = 'ROLLBACK' + (point ? ' TO SAVEPOINT ' + point : '');
  return this.run(q);
};

Client.prototype.savepoint = function(point) {
  return this.run('SAVEPOINT ' + point);
};

Client.prototype.run = function(query, params) {
  var self = this;
  if (query instanceof Node) {
    var obj = query.toQuery();
    query = obj.text;
    params = obj.values;
  }

  var p = new Promise(function(resolve, reject) {
    self.connection.query(query, params, function(err, res) {
      if (err) {
        self.done();
        return reject(err);
      }

      return resolve(result.extend(res));
    });
  });

  return result.promise(p);
};

module.exports = Client;
