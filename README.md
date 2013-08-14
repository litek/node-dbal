# node-dbal

Simple wrapper on top of [pg](https://github.com/brianc/node-postgres) and [sql](https://github.com/brianc/node-sql).

```javascript
// connect with string
var db = require("dbal")("tcp://user:pass@host:5432/database");

// or object
var db = require("dbal")({
  user: "username",
  password: "password",
  port: 5432,
  host: "hostname"
});

db.query("SELECT 'bar' AS foo", function(err, res) {
  // res.rows[0].foo equals bar
});

db.acquire(function(err, connection) {
  // use connection..
  connection.release();
});

var users = db("users");
var query = users.select().where({id: 1});

query.run(function(err, res) {
  // returning result for "SELECT * FROM users WHERE id = 1"
});

// can also be passed to dbal.query
db.query(query, function(err, res) {
  // returning result for "SELECT * FROM users WHERE id = 1"
});

// insert row
db("quotes")
  .insert({author: "Caesar", quote: "Veni, vidi, vici"})
  .returning("id")
  .run(function(err, res) {
    // assuming id is a sequence, res.rows[0].id is the generated value
});

```

## Methods

### instance(table, [columns])
Returns new sql builder instance for table.
Adds a .run method to execute queries directly.

### instance.acquire(callback)
Acquires connection from pool. Returns client with callback to return connection to pool.

### instance.query(query, [params], callback)
Executes query and returns result, releasing connection back to the pool.
