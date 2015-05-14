'use strict';
var expect = require('chai').expect;
var Node = require('sql/lib/node/index');
var sql = require('../lib/sql');
var Dbal = require('../lib/dbal');

describe('sql.Node', function() {
  before(function() {
    this.dbal = new Dbal();
    this.table = this.dbal.define({
      name: 'table',
      columns: ['id', 'name']
    });
  });

  ['run', 'all', 'one'].forEach(function(method) {
    describe('.'+method, function() {
      it('executes query with default adapter', function(done) {
        this.table.select()[method]().catch(function(err) {
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
        
        this.table.select()[method](dbal);
      });
    });
  });
});
