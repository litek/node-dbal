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
        done();
      }).catch(done);
    });
  });

  describe('begins', function() {
    it('starts a transaction', function(done) {
      this.db.begin().then(function(client) {
        client.should.be.instanceof(Client);
        client.should.have.property('commit');
        client.should.have.property('rollback');
        should.equal(undefined, client.done);
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
