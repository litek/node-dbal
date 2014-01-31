"use strict";

var dbal = require("../src/index"),
    sql = require("sql");

describe("sql.Node", function() {
  before(function() {
    this.db = dbal();
    this.table = sql.define({
      name: "table",
      columns: ["id", "name"]
    });
  });

  describe("query", function() {
    it("executes query directly", function(done) {
      this.table.select().exec(this.db).catch(function(err) {
        err.code.should.equal("42P01");
        done();
      });
    });
  });
});
