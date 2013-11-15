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

  describe("acquire", function() {
    it("returns connection", function(done) {
      this.db.acquire(function(err, client) {
        should.not.exist(err);
        client.should.be.instanceof(pg.Client);
        client.release.should.be.type("function");
        client.release();
        done();
      });
    });

    it("promises connection", function(done) {
      this.db.acquire().then(function(client) {
        client.should.be.instanceof(pg.Client);

        return client.query("SELECT 1").then(function(res) {
          res.rowCount.should.equal(1);
          client.release();
          done();
        });
      }).catch(done);
    });

    it("executes sql builder functions", function(done) {
      var table = sql.define({
        name: "table",
        columns: ["id"]
      });

      this.db.acquire().then(function(client) {
        var build = table.select(table.id);

        client.query(build).catch(function(err) {
          err.code.should.equal("42P01");
          done();
        });
      }).catch(done);
    });
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

  describe("fetchOne", function() {
    it("fetches a single row and returns object", function(done) {
      this.db.fetchOne("SELECT 'bar' AS foo", function(err, res) {
        should.not.exist(err);
        res.should.have.property("foo").and.equal("bar");
        done();
      });
    });
  });

  describe("fetchAll", function() {
    it("fetches all rows and returns an array", function(done) {
      this.db.fetchAll("SELECT 'bar' AS foo", function(err, res) {
        should.not.exist(err);
        res.should.be.an.Array;
        res[0].should.have.property("foo").and.equal("bar");
        done();
      });
    });
  });

  describe("transaction", function() {
    it("creates and commits transaction, releasing connection", function(done) {
      var client;

      this.db.transaction()
        .then(function(conn) {
          client = conn;
          client.lastQuery.should.equal("BEGIN");

          return client.query("SELECT 'bar' AS foo");
        })
        .then(function(res) {
          res.should.have.property("rows").and.have.length(1);
          res.rows[0].should.have.property("foo").and.equal("bar");
          
          client.commit().then(function() {
            should.not.exist(client.release);
            client.lastQuery.should.equal("COMMIT");
            done();
          });
        })
        .catch(done);
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
