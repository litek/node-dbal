'use strict'
const pg = require('pg')
const assert = require('assert')
const Promise = require('bluebird')
const Client = require('./client')
const sql = require('./sql')

class Connection {
  /**
   * Constructor, create connection container
   * 
   * @todo Pass pool options etc. to pg
   *
   * @param string
   * @param object
   */
  constructor(url, options) {
    this.url = url || process.env.DBAL_URL
    this.options = options || {}
    this.options.debug = this.options.hasOwnProperty('debug') ? this.options.debug : true
    this.tables = {}
    this.adapter = pg
    this.failure = this.failure.bind(this)
  }

  /**
   * Make sure we get a meaningful stacktrace at the cost of a more expensive call
   *
   * @return function
   */
  failure() {
    let err = !this.options.debug ? null : new Error()

    return function(original) {
      err = err || original
      err.message = original.message
      err.code = original.code || original.sqlState
      return err
    }
  }

  /**
   * Disconnect all pooled clients
   *
   */
  end() {
    return this.adapter.end()
  }

  /**
   * Create an unpooled client
   *
   * @return object
   */
  client() {
    let failure = this.failure

    return new Promise((resolve, reject) => {
      let raw = new this.adapter.Client(this.url)
      raw.connect(function(err) {
        return err ? reject(err) : resolve(new Client(raw, null, failure))
      })
    })
  }

  /**
   * Acquire a pooled client
   *
   * @return object
   */
  acquire() {
    let failure = this.failure

    return new Promise((resolve, reject) => {
      return this.adapter.connect(this.url, function(err, raw, done) {
        return err ? reject(err) : resolve(new Client(raw, done, failure))
      })
    })
  }

  /**
   * Run query and return raw result object
   *
   * @param string
   * @param Array
   * @return object
   */
  run(query, params) {
    assert(typeof(query) === 'string' && query.length, 'Expected a query string')
    assert(!params || params instanceof Array, 'Expected a params array')
    let throws = this.failure()

    return new Promise((resolve, reject) => {
      return this.adapter.connect(this.url, function(err, res, done) {
        if (err) return reject(throws(err))

        res.query(query, params || [], function(err, res) {
          done()
          return err ? reject(throws(err)) : resolve(res)
        })
      })
    })
  }

  /**
   * Run query and return all rows
   *
   * @param string
   * @param Array
   * @return Array
   */
  all(query, params) {
    return this.run(query, params).then(function(res) {
      return res.rows
    })
  }

  /**
   * Run query and return first row or undefined if there are no rows
   *
   * @param string
   * @param Array
   * @return object|undefined
   */
  one(query, params) {
    return this.run(query, params).then(function(res) {
      return res.rows[0]
    })
  }

  /**
   * Get (or define) a table with optional columns returning an sql instance
   * 
   * @todo Add columns if table is already defined
   *
   * @param string
   * @param [columns]
   * @return object
   */
  table(name, columns) {
    if (!this.tables[name]) {
      this.tables[name] = sql.define({
        name: name,
        columns: columns || []
      })

      this.tables[name].__dbal = this
    }

    return this.tables[name]
  }
}

module.exports = Connection
