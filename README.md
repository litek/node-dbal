# node-dbal

Simple wrapper on top of [pg](https://github.com/brianc/node-postgres) and [sql](https://github.com/brianc/node-sql).

```javascript
// connect with string
var db = require("dbal")("tcp://user:pass@host:5432/database");

// using callbacks or promise
var query = "SELECT 'bar' AS foo";
db.query(query, function(err, res) {
  // res.rows[0].foo equals bar
});

db.query(query).then(function(res) {
  // res.rows[0].foo equals bar
});

// using query builder
var users = db.table({
  name: "users",
  columns: ["id"]
});

var sql = users.select().where({id: 1});

sql.exec().then(function(res) {
  // returning result for "SELECT * FROM users WHERE id = 1"
});

// can also be passed to dbal().query
db.query(sql).then(function(err, res) {
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
  .exec()
  .then(function(res) {
    // assuming id is a sequence, res.rows[0].id is the generated value
  });
```

## Methods
Callback methods are also promises.

### instance(config)
Alias for instance.table

### instance.table(config)
Returns new sql builder instance for table.

#### table.exec([dbal], [callback])
Executes query and returns result, releasing connection back to the pool.

### instance.query(query, [params], [callback])
Executes query and returns result, releasing connection back to the pool.

### instance.transaction()
Returns pg client for transaction use.
