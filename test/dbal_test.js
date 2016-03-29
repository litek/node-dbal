'use strict'
const Connection = require('../lib/connection')

describe('dbal', function() {
  beforeEach(function() {
    let url = process.env.DBAL_URL || 'postgres://localhost/dbal_test'
    let db = this.db = new Connection(url)

    return db.run('DROP TABLE IF EXISTS test').then(function() {
      return db.run('CREATE TABLE test (id integer not null, name text not null)')
    }).then(function() {
      return db.run("INSERT INTO test VALUES (1, 'Foo'), (2, 'Bar'), (3, 'Baz')")
    })
  })

  afterEach(function() {
    this.db.run('DROP TABLE test').then(function() {
      return this.db.end()
    }.bind(this))
  })

  require('./lib/connection_test')
  require('./lib/client_test')
  require('./lib/node_test')
})
