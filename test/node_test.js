'use strict';
var expect = require('chai').expect;
var Node = require('sql/lib/node/index');
var sql = require('../lib/sql');
var Dbal = require('../lib/dbal');

describe('sql.Node', function() {
  var dbal, table;

  before(function() {
    dbal = new Dbal();
    table = dbal.define({
      name: 'table',
      columns: ['id', 'name']
    });
  });

  ['run', 'all', 'one'].forEach(function(method) {
    describe('.'+method, function() {
      it('executes query with default adapter', function(done) {
        table.select()[method]().catch(function(err) {
          expect(err.code).equal('42P01');
          done();
        }.bind(this));
      });

      it('executes query with specified adapter', function(done) {
        var dbal = {};
        dbal[method] = function(node) {
          expect(node).instanceof(Node);
          done();
        };
        
        table.select()[method](dbal);
      });
    });
  });

  it('adds columns on demand', function() {
    expect(table.hasColumn('fresh')).equal(false);
    table.get('fresh');
    expect(table.hasColumn('fresh')).equal(true);
  });
});
