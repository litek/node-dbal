"use strict";

var should = require("should"),
    pg = require("pg"),
    sql = require("sql"),
    dbal = require("../src/index"),
    Table = require("sql/lib/table");

describe("DBAL", function() {
  before(function() {
    this.db = dbal(process.env.DATABASE_URL);
    process.env.NODE_ENV = "test";
  });

  it("exposes sql", function() {
    dbal.sql.should.equal(sql);
  });

  describe("query", function() {
    it("runs query and return", function(done) {
      this.db.query("SELECT 'bar' AS foo", function(err, res) {
        should.not.exist(err);
        res.should.have.property("rows").and.have.length(1);
        res.rows[0].should.have.keys("foo");
        res.rows[0].foo.should.equal("bar");
        done();
      });
    });

    it("runs query with promise", function(done) {
      this.db.query("SELECT 'bar' AS foo").then(function(res) {
        res.should.have.property("rows").and.have.length(1);
        res.rows[0].should.have.property("foo").and.equal("bar");
        done();
      });
    });
  });

  describe("transaction", function() {
    it("returns transaction client", function(done) {
      var client;

      this.db.transaction().then(function(conn) {
        client = conn;
        return client.query("SELECT 'bar' AS foo");
      }).then(function(res) {
        res.rows[0].should.have.properties("foo");
        return client.commit();
      }).then(function(res) {
        res.command.should.equal("COMMIT");
        done();
      });
    });
  });

  describe("table", function() {
    var table;

    it("creates and returns table", function() {
      table = this.db.table({
        name: "table",
        columns: ["id"]
      });

      table.should.be.a.Table;
    });

    it("returns table by name", function() {
      this.db.table("table").should.equal(table);
    });

    it("only allows a single definition per table", function(done) {
      try {
        this.db.table({
          name: "table",
          columns: ["id"]
        });
      } catch(err) {
        done();
      }
    });
  });
});
