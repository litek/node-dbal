'use strict';
var should = require('should');
var pg = require('pg');
var Sql = require('sql').Sql;
var Dbal = require('../src/index');
var Client = require('../src/client');

describe('DBAL', function() {
  before(function() {
    this.db = new Dbal(process.env.DATABASE_URL);
    process.env.NODE_ENV = 'test';
  });

  describe('acquire', function() {
    it('returns a client instance', function(done) {
      this.db.acquire().then(function(client) {
        client.should.be.instanceof(Client);
        client.done();

        (function() {
          client.done();
        }).should.throw();
        done();
      }).catch(done);
    });
  });

  describe('transaction', function() {
    it('starts a transaction', function(done) {
      var tid, client;

      this.db.transaction().then(function(res) {
        (client = res).should.be.instanceof(Client);
        return client.one('SELECT txid_current() txid');
      }).then(function(res) {
        tid = res.txid;
        return client.one('SELECT txid_current() txid');
      }).then(function(res) {
        res.txid.should.equal(tid);
        done();
      }).catch(done);
    });
  });

  describe('run', function() {
    it('runs query with promise', function(done) {
      this.db.run("SELECT 'bar' AS foo").then(function(res) {
        res.should.have.property('rows').and.have.length(1);
        res.rows[0].should.have.property('foo').and.equal('bar');
        done();
      }).catch(done);
    });
  });

  describe('all', function() {
    it('returns all rows', function(done) {
      this.db.all("SELECT 'bar' AS foo").then(function(res) {
        res.should.be.instanceof(Array).and.have.length(1);
        res[0].should.have.property('foo').and.equal('bar');
        done();
      }).catch(done);
    });
  });

  describe('one', function() {
    it('returns first row', function(done) {
      this.db.one("SELECT 'bar' AS foo").then(function(res) {
        res.should.eql({foo: 'bar'});
        done();
      }).catch(done);
    });
  });
});
