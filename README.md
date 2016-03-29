# node-dbal

Simple wrapper on top of [pg](https://github.com/brianc/node-postgres) and [sql](https://github.com/brianc/node-sql).

```javascript
'use strict'
const Dbal = require('dbal')
const db = new Dbal(process.env.DBAL_URL)

db.table('users').insert({name: 'Foo'}).returning('id', 'created', 'name').one().then(function(res) {
  console.log('Inserted new user: ' + JSON.stringify(res))
}).catch(function(err) {
  console.log(err.stack)
})
```
