import * as assert from 'assert'
import * as pg from 'pg'
import {Sql} from './sql'

export abstract class Adapter {
  public sql: Sql
  
  constructor() {
    this.sql = new Sql(<any>this)
  }
  
  /**
   * Run query and return raw result set
   */
  abstract run(text: pg.QueryConfig | string, values?: any[]): Promise<pg.ResultSet>
  
  /**
   * Get all rows from result set
   */
  all(text: pg.QueryConfig | string, values?: any[]) {
    return this.run(text, values).then(function(res) {
      return res.rows
    })
  }
  
  /**
   * Get first row from result set
   */
  one(text: pg.QueryConfig | string, values?: any[]) {
    return this.run(text, values).then(function(res) {
      return res.rows[0]
    })
  }
}
