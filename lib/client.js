'use strict'
const assert = require('assert')
const Promise = require('bluebird')

class Client {
  /**
   * Constructor
   *
   * @param pg.Client
   * @param [function]
   */
  constructor(socket, done, failure) {
    this.socket = socket
    this.pooled = !!done
    this.failure = failure
    Object.defineProperty(this, '_done', {
      value: done ? done : socket.end.bind(socket)
    })
  }

  /**
   * Disconnect client or return to pool
   *
   */
  end() {
    return this._done()
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
      this.socket.query(query, params || [], function(err, res) {
        return err ? reject(throws(err)) : resolve(res)
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
   * @return Array|undefined
   */
  one(query, params) {
    return this.run(query, params).then(function(res) {
      return res.rows[0]
    })
  }
}

module.exports = Client
