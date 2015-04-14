'use strict';
var Dbal = require('../src/index');
var Node = require('sql/lib/node');

describe('sql.Node', function() {
  before(function() {
    this.dbal = new Dbal();
    this.table = this.dbal.define({
      name: 'table',
      columns: ['id', 'name']
    });
  });

  describe('query', function() {
    it('executes query with default adapter', function(done) {
      this.table.select().run().catch(function(err) {
        err.code.should.equal('42P01');
        done();
      }.bind(this));
    });

    it('executes query with specified adapter', function(done) {
      var dbal = new Dbal();
      dbal.run = function(node) {
        node.should.be.instanceof(Node);
        done();
      };

      dbal.should.not.equal(this.dbal);
      this.table.select().run(dbal);
    });
  });
});
