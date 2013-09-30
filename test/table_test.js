var should = require("should"),
    table = require("../src/table"),
    Column = require("../node_modules/sql/lib/column"),
    Query = require("../node_modules/sql/lib/node/query");

describe("Table", function() {
  it("adds columns dynamically", function() {
    var users = table(null, "users");
    should.not.exist(users.id);
    users.get("id").should.be.instanceof(Column);
    users.id.should.be.instanceof(Column);
  });

  it("defines columns", function() {
    var users = table(null, "users", ["id"]);
    users.id.should.be.instanceof(Column);
  });

  it("executes queries", function(done) {
    var connection = {
      query: function(query, cb) {
        cb(query);
      }
    };

    table(connection, "users").select().exec(function(query) {
      query.should.be.instanceof(Query);
      done();
    });
  });
});
