import * as assert from 'assert'
import * as pg from 'pg'
import {Adapter} from './adapter'
import {Client} from './client'
import {Sql} from './sql'

export class Connection extends Adapter {
  private pool: pg.ClientPool
  
  /**
   * Create new connection object
   */
  constructor(private config: pg.Config | string) {
    super()
    this.pool = pg.pools.getOrCreate(config)
  }
  
  /**
   * Acquire client from pool
   */
  acquire(): Promise<Client> {
    return new Promise((resolve, reject) => {
      this.pool.acquire((err, client) => {
        let done = this.pool.release.bind(this.pool, client)
        err ? reject(err) : resolve(new Client(client, done))
      })
    })
  }
  
  /**
   * Create standalone client
   */
  client(): Promise<Client> {
    return new Promise((resolve, reject) => {
      let client = new pg.Client(this.config)
      client.connect(function(err) {
        err ? reject(err) : resolve(new Client(client))
      })
    })
  }
  
  /**
   * Disconnect all pooled clients
   */
  end() {
    this.pool.destroyAllNow()
  }
  
  /**
   * Run query and return raw result set
   */
  run(text: pg.QueryConfig | string, values?: any[]): Promise<pg.ResultSet> {
    let query: pg.QueryConfig = typeof(text) === 'string' ? {text: <string>text, values} : <pg.QueryConfig>text 
    
    return new Promise((resolve, reject) => {
      this.pool.acquire((err, client) => {
        if (err) return reject(err)
        
        client.query(<pg.QueryConfig>query, (err, res) => {
          this.pool.release(client)
          
          if (err) {
            Object.assign(err, {query: {text: query.text, values: query.values}})
            reject(err)
          } else {
            resolve(res)
          }
        })
      })
    })
  }
}
