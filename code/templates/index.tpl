import Knex, { Transaction } from 'knex'
import database, { Database } from '../helpers/database'

import * as classes from './classes'

// returns models instanciated with Knex connection
// we could do this in a more generic / automatic way,
// but we would lose the syntax hints (methods, parameters, etc..)
class Models {
  private database: Database
  private transaction: Transaction

  {{#each tableClasses}}
  public {{this.className}}: classes.{{this.className}}
  {{/each}}

  constructor () {
    this.database = database
    this.init(this.database.handle)
  }

  private init (handle: Knex | Transaction) {
    {{#each tableClasses}}
    this.{{this.className}} = new classes.{{this.className}}(handle)
    {{/each}}
  }

  public async transactionInit () {
    this.transaction = await this.database.handle.transaction()
    this.init(this.transaction)
  }

  public async transactionCommit () {
    await this.transaction.commit()
    this.init(this.database.handle)
  }

  public async transactionRollback () {
    await this.transaction.rollback()
    this.init(this.database.handle)
  }
}

export * from './interfaces'
export default Models
