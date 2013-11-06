var pg = require("pg");
require("../src/client");

describe("pg.Client", function() {
  describe("query", function() {
    it("functions as a promise", function(done) {
      pg.connect(null, function(err, client, release) {
        if (err) return done(err);
        client.query("SELECT 1").then(function(res) {
          res.should.have.property("rowCount").and.equal(1);
          release();
          done();
        }).catch(done);
      });
    });
  });

  describe("fetchOne", function() {
    it("fetches a single row", function(done) {
      pg.connect(null, function(err, client, release) {
        if (err) return done(err);
        client.fetchOne("SELECT 'bar' AS foo").then(function(res) {
          res.should.have.property("foo").and.equal("bar");
          done();
        }).catch(done);
      });
    });
  });

  describe("fetchAll", function() {
    it("fetches rows array", function(done) {
      pg.connect(null, function(err, client, release) {
        if (err) return done(err);
        client.fetchAll("SELECT 'bar' AS foo").then(function(res) {
          res.should.be.instanceof(Array).and.have.length(1);
          res[0].should.have.property("foo").and.equal("bar");
          done();
        }).catch(done);
      });
    });
  });
});

