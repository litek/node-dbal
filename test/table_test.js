var should = require("should"),
    table = require("../src/table"),
    Column = require("../node_modules/sql/lib/column");

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
      query: function(query, args, cb) {
        cb(query, args);
      }
    };

    table(connection, "users").select().exec(function(query, args) {
      query.should.be.a.String;
      args.should.be.an.instanceof.Array;
      done();
    });
  });
});
