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

db.all(query).then(function(res) {
  // res equals the rows array
});

db.one(query).then(function(res) {
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
  .one()
  .then(function(res) {
    // assuming id is a sequence, res.id is the generated value
  });
```

## Methods

### new Dbal(connstr)
Create new Dbal with connection string.

### dbal.run(query, params)
### dbal.run(node)
Acquires a client, runs a query, then releases client back to pool and returns results  

### dbal.all(query, params)
### dbal.all(node)
Run query and return all rows

### dbal.one(query, params)
### dbal.one(node)
Run query and return first row

### dbal.define(config)
Define table for sql

### dbal.table(name)
Retrieve defined sql table node

#### node.run([dbal])
#### node.all([dbal])
#### node.one([dbal])

### dbal.acquire()
Acquire client from pool

#### client.done()
Release client back to pool

#### client.run(query, params)
#### client.run(node)

#### client.all(query, params)
#### client.all(node)

#### client.one(query, params)
#### client.one(node)

### dbal.begin()
Acquire a client from pool with a transaction started.
done() is not supported, a transaction should either be explicitly rolled back or commited

#### transaction.commit()
Commit transaction, releasing client back to pool

#### transaction.rollback()
Rollback transaction, releasing client back to pool

#### transaction.run(query, params)
#### transaction.run(node)

#### transaction.all(query, params)
#### transaction.all(node)

#### transaction.one(query, params)
#### transaction.one(node)
