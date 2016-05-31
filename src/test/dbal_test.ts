import {Connection} from '../connection'

describe('this.dbal', function() {
  beforeEach(async function() {
    this.db = new Connection('postgres://localhost/dbal_test')

    await this.db.run('DROP TABLE IF EXISTS test')
    await this.db.run('CREATE TABLE test (id integer not null, name text not null)')
    await this.db.run("INSERT INTO test VALUES (1, 'Foo'), (2, 'Bar'), (3, 'Baz')")
  })

  afterEach(async function() {
    await this.db.run('DROP TABLE test')
    this.db.end()
  })

  require('./lib/connection_test')
  // require('./lib/client_test')
})
