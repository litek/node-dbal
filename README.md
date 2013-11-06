# node-dbal

Simple wrapper on top of [pg](https://github.com/brianc/node-postgres) and [sql](https://github.com/brianc/node-sql).

```javascript
// connect with string
var dbal = require("dbal");
var db = dbal("tcp://user:pass@host:5432/database");

// or object
var db = dbal({
  user: "username",
  password: "password",
  port: 5432,
  host: "hostname"
});

// using callbacks
db.query("SELECT 'bar' AS foo", function(err, res) {
  // res.rows[0].foo equals bar
});

db.fetchOne("SELECT 'bar' AS foo", function(err, res) {
  // res.foo equals bar
});

db.fetchAll("SELET 'bar' AS foo", function(err, res) {
  // res[0].foo equals bar
});

// using promises
db.fetchOne("SELECT 'bar' AS foo")
  .then(function(row) {
    // row.bar equals foo
  })
  .catch(function(err) {
    // an error occurred
  });

db.acquire(function(err, connection) {
  // use connection..
  connection.release();
});

// using query builder
var users = db.table({
  name: "users",
  columns: ["id"]
});

var sql = users.select().where({id: 1});

sql.query(function(err, res) {
  // returning result for "SELECT * FROM users WHERE id = 1"
});

// can also be passed to dbal.query
db.query(sql, function(err, res) {
  // returning result for "SELECT * FROM users WHERE id = 1"
});

// insert row
var quotes = db.table({
  name: "quotes",
  columns: ["author", "quote"]
});

quotes
  .insert({author: "Caesar", quote: "Veni, vidi, vici"})
  .returning("id")
  .query(function(err, res) {
    // assuming id is a sequence, res.rows[0].id is the generated value
});

// transaction using promises
var client;

db.table({
  name: "authors",
  columns: ["id", "name"];
});

db.table({
  name: "works",
  columns: ["id", "author_id", "title"]
});

db.transaction()
  .then(function(conn) {
    client = conn;
    return db("authors").insert({name: "Herman Hesse"}).returning("id").fetchOne(client);
  })
  .then(function(row) {
    var author_id = row.id;
    return db("works").insert({author_id: author_id, title: "Das Glasperlenspiel"}).query(client);
  })
  .then(function() {
    client.commit();
  });
```

## Methods
All callback methods are also promises.

### instance.table(config)
Returns new sql builder instance for table.
Adds query, fetchOne and fetchAll methods to execute queries directly.

### instance.query(query, [params], callback)
Executes query and returns result, releasing connection back to the pool.

### instance.fetchOne(query, [params], callback)
Executes query returning single row, releases connection back to pool

### instance.fetchAll(query, [params], callback)
Executes query returning rows array, releases connection back to pool

### instance.acquire(callback)
Acquires connection from pool. Returns client with callback to return connection to pool.

### instance.transaction(callback)
Acquires connection and begins transaction.
Adds two methods to the connection

#### connection.commit(callback)
Commits the transaction, releasing connection back into the connection pool

#### connection.rollback(callback)
Rollback transaction, releasing connection back into the connection pool
