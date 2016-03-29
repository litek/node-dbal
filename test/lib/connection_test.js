'use strict'
const expect = require('chai').expect
const Connection = require('../../lib/connection')
const Client = require('../../lib/client')

describe('Connection', function() {  
  describe('.run', function() {
    it('runs query', function() {
      return this.db.run('SELECT * FROM test').then(function(res) {
        expect(res.rows).instanceof(Array).length(3)
      })
    })

    it('throws on error with a meaningful stack', function(done) {
      this.db.run('SELECT * FROM notatable').then(done, function(err) {
        let files = err.stack.split('\n').slice(1).map(function(line) {
          return line.replace(/^.*\(([^)]+).*/, '$1').split(':')[0]
        })

        expect(files).contains(__filename)
        done()
      })
    })

    it('throws on error with regular stack in non-debug mode', function(done) {
      let options = this.db.options
      options.debug = false

      this.db.run('SELECT * FROM notatable').then(done, function(err) {
        let files = err.stack.split('\n').slice(1).map(function(line) {
          return line.replace(/^.*\(([^)]+).*/, '$1').split(':')[0]
        })

        options.debug = true
        expect(files).not.contains(__filename)
        done()
      })
    })
  })

  describe('.all', function() {
    it('fetches all rows', function() {
      return this.db.all('SELECT * FROM test').then(function(rows) {
        expect(rows).instanceof(Array).length(3)
      })
    })
  })

  describe('.one', function() {
    it('fetches first row', function() {
      return this.db.one('SELECT * FROM test ORDER BY id DESC').then(function(row) {
        expect(row).an('object').keys('id', 'name')
        expect(row.id).equals(3)
      })
    })
  })

  describe('.acquire', function() {
    it('acquires a pooled client', function() {
      return this.db.acquire().then(function(client) {
        expect(client).instanceof(Client)
        expect(client.pooled).equals(true)
        client.end()
      })
    })
  })

  describe('.client', function() {
    it('creates a new client', function() {
      return this.db.client().then(function(client) {
        expect(client).instanceof(Client)
        expect(client.pooled).equals(false)
        client.end()
      })
    })
  })
})
