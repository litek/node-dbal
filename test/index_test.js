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
    this.db.acquire(function(err, client, release) {
      should.not.exist(err);
      client.should.be.instanceof(pg.Client);
      release.should.be.a("function");
      release();
      done();
    });
  });

  it("runs query and return", function(done) {
    this.db.query("SELECT 'bar' AS foo", function(err, res) {
      should.not.exist(err);
      res.should.have.property("rows");
      res.rows.should.have.length(1);
      res.rows[0].should.have.keys("foo");
      res.rows[0].foo.should.equal("bar");
      done();
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
