'use strict';
var expect = require('chai').expect;
var Dbal = require('../lib/dbal');

describe('Dbal', function() {
  var dbal;

  beforeEach(function() {
    dbal = new Dbal();
    dbal.pg.end();
  });

  describe('.client', function() {
    it('acquires standalone client', function(done) {
      var client = dbal.client();
      client.connect().then(function() {
        var pool = dbal.pg.pools.all;
        expect(Object.keys(pool)).length(0);
        client.end();
        done();
      }).catch(done);
    });
  });

  describe('.acquire', function() {
    it('acquires pooled client', function(done) {
      var client = dbal.acquire();
      client.connect().then(function() {
        var pool = dbal.pg.pools.all;
        expect(Object.keys(pool)).length(1);
        client.end();
        expect(Object.keys(pool)).length(1);
        dbal.end();
        expect(Object.keys(pool)).length(0);
        done();
      }).catch(done);
    });
  });

  describe('.run', function() {
    it('runs query returning to pool', function(done) {
      dbal.run('SELECT 1').then(function(res) {
        expect(res.rowCount).equal(1);
        done();
      }).catch(done);
    });

    it('throws on error', function(done) {
      dbal.run('SELECT * FROM "nonexistant"').then(done).catch(function(err) {
        expect(err.code).equal('42P01');
        done();
      });
    });
  });

  it('.all returns all rows', function(done) {
    dbal.all('SELECT * FROM generate_series(1,5)').then(function(rows) {
      expect(rows).instanceof(Array).length(5);
      done();
    }).catch(done);
  });

  it('.one returns first row', function(done) {
    dbal.one("SELECT 'foo' as bar").then(function(row) {
      expect(row).all.keys('bar');
      expect(row.bar).equal('foo');
      done();
    }).catch(done);
  });
});
