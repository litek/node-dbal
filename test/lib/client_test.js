'use strict'
const expect = require('chai').expect
const Connection = require('../../lib/connection')
const Client = require('../../lib/client')

describe('Client', function() {
  beforeEach(function() {
    return this.db.client().then(function(client) {
      this.client = client
    }.bind(this))
  })

  afterEach(function() {
    this.client.end()
  })

  describe('.run', function() {
    it('runs query', function() {
      return this.client.run('SELECT * FROM test').then(function(res) {
        expect(res.rows).instanceof(Array).length(3)
      })
    })

    it('throws on error with a meaningful stack', function(done) {
      this.client.run('SELECT * FROM notatable').then(done, function(err) {
        let files = err.stack.split('\n').slice(1).map(function(line) {
          return line.replace(/^.*\(([^)]+).*/, '$1').split(':')[0]
        })

        expect(files).contains(__filename)
        done()
      })
    })
  })

  describe('.all', function() {
    it('fetches all rows', function() {
      return this.client.all('SELECT * FROM test').then(function(rows) {
        expect(rows).instanceof(Array).length(3)
      })
    })
  })

  describe('.one', function() {
    it('fetches first row', function() {
      return this.client.one('SELECT * FROM test ORDER BY id DESC').then(function(row) {
        expect(row).an('object').keys('id', 'name')
        expect(row.id).equals(3)
      })
    })
  })
})
