import {expect} from 'chai'
import {Client} from '../../client'
import {Connection} from '../../connection'

describe('Connection', function() { 
  describe('.run', function() {
    it('runs query', async function() {
      let res = await this.db.run('SELECT * FROM test')
      expect(res.rows).instanceof(Array).length(3)
    })

    it('throws on error with query', function() {
      let text = 'SELECT * FROM notatable WHERE id = $1'
      let values = [1]
      let throws = false
      
      return this.db.run(text, values).catch(function(err: any) {
        expect(err.query).eqls({text, values})
        throws = true
      }).then(function() {
        expect(throws).to.be.true
      })
    })
  })

  describe('.all', function() {
    it('fetches all rows', async function() {
      let rows = await this.db.all('SELECT * FROM test')
      expect(rows).instanceof(Array).length(3)
    })
  })

  describe('.one', function() {
    it('fetches first row', async function() {
      let row = await this.db.one('SELECT * FROM test ORDER BY id DESC')
      expect(row).an('object').keys('id', 'name')
      expect(row.id).equals(3)
    })
  })

  describe('.acquire', function() {
    it('acquires a pooled client', async function() {
      let client = await this.db.acquire()
      expect(client).instanceof(Client)
      expect(client.pooled).equals(true)
      client.end()
    })
  })

  describe('.client', function() {
    it('creates a new client', async function() {
      let client = await this.db.client()
      expect(client).instanceof(Client)
      expect(client.pooled).equals(false)
      client.end()
    })
    
    describe('.prepare', function() {
      it('prepares a query for running', async function() {
        let client: Client = await this.db.client()
        let rows = await client.prepare('SELECT * FROM test').all()
        expect(rows).instanceof(Array).length(3)
      })
    })
  })
  
  describe('.sql', function() {
    describe('.format', function() {
      it('prepares and escapes sql query', function() {
        let table = 'table"Name'
        let id = 10
        let query = (<Connection>this.db).sql.format`SELECT * FROM "${table}" WHERE id = ${id}`
        
        expect(query).eqls({
          text: 'SELECT * FROM "table\\"Name" WHERE id = $1',
          values: [id]
        })
      })
    })
    
    describe('.run', function() {
      it('runs query', async function() {
        let res = await (<Connection>this.db).sql.run`SELECT * FROM test`
        expect(res.rows).instanceof(Array).length(3)
      })
    })
    
    describe('.all', function() {
      it('fetches all rows', async function() {
        let rows = await (<Connection>this.db).sql.all`SELECT * FROM test`
        expect(rows).instanceof(Array).length(3)
      })
    })
    
    describe('.all', function() {
      it('fetches first row', async function() {
        let row = await (<Connection>this.db).sql.one`SELECT * FROM test ORDER BY id DESC`
        expect(row).an('object').keys('id', 'name')
      })
    })
  })
})
