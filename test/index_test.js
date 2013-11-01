var should = require("should"),
    pg = require("pg"),
    sql = require("sql"),
    dbal = require("../src/index");

describe("Index", function() {
  before(function() {
    // asumes valid environment variables
    // http://www.postgresql.org/docs/9.2/static/libpq-envars.html
    this.db = dbal();
  });

  it("returns connection", function(done) {
    this.db.acquire(function(err, client) {
      should.not.exist(err);
      client.should.be.instanceof(pg.Client);
      client.release.should.be.a("function");
      client.release();
      done();
    });
  });

  it("promises connection", function(done) {
    this.db.acquire().then(function(client) {
      client.should.be.instanceof(pg.Client);
      client.release();
      done();
    });
  });

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

  it("runs connection queries with promise", function(done) {
    this.db.acquire(function(err, client) {
      client.query("SELEcT 'foo'").then(function(res) {
        res.should.have.property("rows").and.have.length(1);
        done();
      });
    });
  });

  it("creates and commits transaction, releasing connection", function(done) {
    var client, release;

    this.db.transaction().then(function(conn) {
      client = conn, release = client.release;
      client.release = function() {
        release();
        done();
      };

      client.activeQuery.text.should.equal("BEGIN TRANSACTION");
    }).then(function() {
      return client.query("SELECT 'bar' AS foo");
    }).then(function(res) {
      res.should.have.property("rows").and.have.length(1);
      res.rows[0].should.have.property("foo").and.equal("bar");
      
      client.commit().then(function() {
        client.activeQuery.text.should.equal("COMMIT");
      });
    });
  });

  it("creates sql tables", function() {
    var users = this.db("users");
    users.should.be.instanceof(sql.Table);
  });

  it("executes sql builder objects", function(done) {
    var users = this.db("non-existant-table"),
        query = users.select();

    this.db.query(query, function(err, res) {
      should.exist(err);
      err.code.should.equal("42P01");
      done();
    });
  });
});
