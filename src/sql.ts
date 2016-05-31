import * as pg from 'pg'
import {Client} from './client'
import {Connection} from './connection'

export class Sql {
  static format(strings: string[], ...params: any[]): pg.QueryConfig {
    let query = strings.slice(0, 1)
    let values: any = []
    
    params.forEach(function(value, i) {
      let append = strings[i+1] || ''
      let left = strings[i].slice(-1)
      let right = append.slice(0, 1)
      
      if ((left === '"' && right === '"') || (left === "'" && right === "'")) {
        value = left === '"' ? value.replace(/"/g, '\\"') : value.replace(/'/g, "\\'")
      } else {
        value = '$' + values.push(value)
      }
      
      query.push(value, append)
    })
    
    let text = query.join('').trim()
    
    return {text, values}
  }
  
  constructor(private connection: Client | Connection) {}
  
  format(strings: string[], ...params: any[]) {
    return Sql.format(strings, ...params)
  }
  
  run(strings: string[], ...params: any[]) {
    return this.connection.run(Sql.format(strings, ...params))
  }
  
  all(strings: string[], ...params: any[]) {
    return this.connection.all(Sql.format(strings, ...params))
  }
  
  one(strings: string[], ...params: any[]) {
    return this.connection.one(Sql.format(strings, ...params))
  }
} 
