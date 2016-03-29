'use strict';
var expect = require('chai').expect;
var sql = require('../../lib/sql');
var Connection = require('../../lib/connection');

describe('sql.Node', function() {
  beforeEach(function() {
    this.table = this.db.table('table', ['id', 'name'])
  });

  it('adds columns on demand', function() {
    expect(this.table.hasColumn('fresh')).equal(false);
    let fresh = this.table.get('fresh');
    expect(this.table.hasColumn('fresh')).equal(true);
    expect(this.table.get('fresh')).equals(fresh)
  });

  ['run', 'all', 'one'].forEach(function(method) {
    describe('.'+method, function() {
      it('executes query with default connection', function(done) {
        this.table.select()[method]().catch(function(err) {
          expect(err.code).equal('42P01');
          done();
        }.bind(this));
      });

      it('executes query with specified connection', function(done) {
        var connection = {};
        connection[method] = function(query, params) {
          expect(query).a('string');
          done();
        };
        
        this.table.select()[method](connection);
      });
    });
  });
});
