'use strict';
var expect = require('chai').expect;
var dbal = require('../lib/dbal');

describe('dbal', function() {
  var db;

  beforeEach(function() {
    db = dbal('postgres://localhost/postgres');
    db.pg.end();
  });

  describe('.table', function() {
    it('adds columns dynamically', function() {
      var users = db.define({name: 'users', columns: ['id']});
      expect(users.id).an('object');
      db.define('users', ['email']);
      expect(users.email).an('object');
    });

    it('callable is an alias for .table', function() {
      var users = db({name: 'users', columns: ['id']});
      expect(users.id).an('object');
    });
  });

  describe('.client', function() {
    it('acquires standalone client', function(done) {
      var client = db.client();
      client.connect().then(function() {
        var pool = db.pg.pools.all;
        expect(Object.keys(pool)).length(0);
        client.end();
        done();
      }).catch(done);
    });
  });

  describe('.acquire', function() {
    it('acquires pooled client', function(done) {
      var client = db.acquire();
      client.connect().then(function() {
        var pool = db.pg.pools.all;
        expect(Object.keys(pool)).length(1);
        client.end();
        expect(Object.keys(pool)).length(1);
        db.end();
        expect(Object.keys(pool)).length(0);
        done();
      }).catch(done);
    });
  });

  describe('.run', function() {
    it('runs query returning to pool', function(done) {
      db.run('SELECT 1').then(function(res) {
        expect(res.rowCount).equal(1);
        done();
      }).catch(done);
    });

    it('throws on error', function(done) {
      db.run('SELECT * FROM "nonexistant"').then(done).catch(function(err) {
        expect(err.code).equal('42P01');
        done();
      });
    });
  });

  it('.all returns all rows', function(done) {
    db.all('SELECT * FROM generate_series(1,5)').then(function(rows) {
      expect(rows).instanceof(Array).length(5);
      done();
    }).catch(done);
  });

  it('.one returns first row', function(done) {
    db.one("SELECT 'foo' as bar").then(function(row) {
      expect(row).all.keys('bar');
      expect(row.bar).equal('foo');
      done();
    }).catch(done);
  });
});
