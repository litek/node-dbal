import * as pg from 'pg'
import {Adapter} from './adapter'
import {Sql} from './sql'

export class Client extends Adapter {
  get pooled() {
    return !!this.done
  }
  
  constructor(private client: pg.Client, private done?: Function) {
    super()
  }
  
  /**
   * End connection
   */
  end() {
    this.done ? this.done() : this.client.end()
  }
  
  /**
   * Run query and return raw result set
   */
  run(text: pg.QueryConfig | string, values?: any[]): Promise<pg.QueryResult> {
    let query: pg.QueryConfig = typeof(text) === 'string' ? {text: <string>text, values} : <pg.QueryConfig>text 
    
    return new Promise((resolve, reject) => {
      this.client.query(<pg.QueryConfig>query, (err, res) => {  
        if (err) {
          Object.assign(err, {query: {text: query.text, values: query.values}})
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  }
  
  /**
   * Prepare a query
   */
  prepare(text: string) {
    let name = Date.now() + '-' + Math.random()
    
    return {
      run: (values?: any[]) => this.run({name, text, values}),
      all: (values?: any[]) => this.all({name, text, values}),
      one: (values?: any[]) => this.one({name, text, values})
    }
  }
}
