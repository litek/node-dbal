'use strict';
var Node = require('./node');
var Promise = require('bluebird');

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

  return new Promise(function(resolve, reject) {
    self.connection.query(query, params, function(err, res) {
      if (err) {
        self.done();
        return reject(err);
      }

      return resolve(res);
    });
  });
};

Client.prototype.one = function() {
  return this.run.apply(this, arguments).then(function(res) {
    return res.rowCount > 0 ? res.rows[0] : undefined;
  });
};

Client.prototype.all = function() {
  return this.run.apply(this, arguments).then(function(res) {
    return res.rows;
  });
};

module.exports = Client;
