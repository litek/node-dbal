# node-dbal

Simple wrapper on top of [pg](https://github.com/brianc/node-postgres) and [sql](https://github.com/brianc/node-sql).

## Version 0.3
Library has been mostly rewritten. Only promises are now supported.

```javascript
// connect with string
var db = require("dbal")("tcp://user:pass@host:5432/database");
var query = "SELECT 'bar' AS foo";

db.run(query).then(function(res) {
  // res.rows[0].foo equals bar
});

db.run(query).all().then(function(res) {
  // res equals the rows array
});

db.run(query).row().then(function(res) {
  // res equals the first entry in the rows array
});

// using query builder
var users = db.define({
  name: 'users',
  columns: ['id']
});

var sql = users.select().where({id: 1});

// can use .run/all/one
sql.run().then(function(res) {
  // returning result for "SELECT * FROM users WHERE id = 1"
});

// insert row - tables are registered on the dbal instance
var quotes = db.define({
  name: 'quotes'
  columns: ['author', 'quote']
});

db.table('quotes')
  .insert({author: 'Caesar', quote: 'Veni, vidi, vici'})
  .returning('id')
  .run()
  .column()
  .then(function(id) {
    // assuming id is a sequence, id is the generated value
  });
```

## Methods

### new Dbal(connstr)
Create new Dbal with connection string.

### dbal.run(query, params)
### dbal.run(node)
Acquires a client, runs a query, then releases client back to pool and returns results  

### dbal.define(config)
Define table for sql

### dbal.table(name)
Retrieve defined sql table node

#### node.run([dbal])

### dbal.acquire()
Acquire client from pool

### dbal.client()
Acquire standalone (non-pooled) client

#### client.done()
Release client back to pool

#### client.run(query, params)
#### client.run(node)

##### result.all()
##### result.row()
##### result.column()
##### result.assign(target)

#### client.begin()
Begin transaction

#### client.commit()
Commit transaction

#### client.rollback([savepoint])
Rollback connection

#### client.savepoint(savepoint)
Set a transaction save point

### dbal.transaction()
Acquire a client from pool with a transaction started.

#### transaction.commit()
Commit transaction, releasing client back to pool

#### transaction.rollback()
Rollback transaction, releasing client back to pool

#### transaction.run(query, params)
#### transaction.run(node)
