'use strict';
var expect = require('chai').expect;
var Dbal = require('../lib/dbal');

describe('Dbal', function() {
  describe('.acquire', function() {
    it('acquires pooled client', function() {
      var dbal = Dbal();
      var client = dbal.acquire();
      client.connect().then(function() {
        var count = Object.keys(dbal.pg.pools.all).length;
        expect(count).equal(1);
        client.end();
        expect(count).equal(0);
      });
    });
  });

  describe('.client', function() {
    it('acquires standalone client', function() {
      var dbal = Dbal();
      var client = dbal.client();
      client.connect().then(function() {
        var count = Object.keys(dbal.pg.pools.all).length;
        expect(count).equal(0);
        client.end();
      });
    });
  });

  describe('.run', function() {
    it('runs query returning to pool', function(done) {
      var dbal = Dbal();
      dbal.run('SELECT 1').then(function(res) {
        expect(res.rowCount).equal(1);
        done();
      }).catch(done);
    });

    it('throws on error', function(done) {
      var dbal = Dbal();
      dbal.run('SELECT * FROM "nonexistant"').then(done).catch(function(err) {
        expect(err.code).equal('42P01');
        done();
      });
    });

    it('attaches .all promise', function(done) {
      var dbal = Dbal();
      dbal.run('SELECT * FROM generate_series(1,5)').all().then(function(rows) {
        expect(rows).instanceof(Array).length(5);
        done();
      }).catch(done);
    });

    it('attaches .one promise', function(done) {
      var dbal = Dbal();
      dbal.run("SELECT 'foo' as bar").one().then(function(row) {
        expect(row).all.keys('bar');
        expect(row.bar).equal('foo');
        done();
      }).catch(done);
    });
  });
});
