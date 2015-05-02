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

  describe('client', function() {
    it('returns a standalone client instance', function(done) {
      this.db.client().then(function(client) {
        client.done();
        done();
      }).catch(done);
    });
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
        return client.run('SELECT txid_current() txid').row();
      }).then(function(res) {
        tid = res.txid;
        return client.run('SELECT txid_current() txid').column();
      }).then(function(txid) {
        txid.should.equal(tid);
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
      this.db.run("SELECT 'bar' AS foo").all().then(function(res) {
        res.should.be.instanceof(Array).and.have.length(1);
        res[0].should.have.property('foo').and.equal('bar');
        done();
      }).catch(done);
    });
  });

  describe('row', function() {
    it('returns first row', function(done) {
      this.db.run("SELECT 'bar' AS foo").row().then(function(res) {
        res.should.eql({foo: 'bar'});
        done();
      }).catch(done);
    });
  });

  describe('column', function() {
    it('returns first column', function(done) {
      this.db.run("SELECT 'bar' AS foo").column().then(function(res) {
        res.should.eql('bar');
        done();
      }).catch(done);
    });
  });

  describe('assign', function() {
    it('copies first row to object', function(done) {
      var obj = {id: 1};
      this.db.run("SELECT 'bar' AS foo, 'qux' AS baz").assign(obj).then(function(res) {
        obj.should.equal(res);
        obj.should.have.properties('id', 'foo', 'baz');
        done();
      }).catch(done);
    });
  });
});
