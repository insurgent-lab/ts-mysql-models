# ts-mysql-models

This is an attempt to auto generate a boilerplate for projects using [TypeScript](https://github.com/Microsoft/TypeScript) in combination with MySql. Generating interfaces and ORM-like sturctures allowes the IDE to provide auto-completion and compile time error handling. This project relies heavily on [Knex](https://github.com/tgriesser/knex)

# WARNING: This is being reworked, please wait for a bit because it is unstable for now.

## Examples

Just initialize with a knex instance and call respective function to start generating.

```js
import { TsBuilder } from "ts-mysql-model"
import * as Knex from "knex"

// Create a knex instance
var knex = Knex({
  client: 'mysql',
  connection: {
    host: 'db',
    user: 'admin',
    password: 'password',
    database: 'mydb',
  },
});

async function build() {
  // init and call respective function with a folder that exists
  let tsBuilder = await new TsBuilder().init(knex)
  tsBuilder.renderClassFiles('./db/inserter/')
  tsBuilder.renderInserter('./db/inserter/')
  tsBuilder.renderTableFile('./db/')
  tsBuilder.renderViewFile('./db/')
  tsBuilder.renderStoredProcedure('./db/')
  knex.destroy()
}

build()
```

## Example
[Sample project](https://github.com/AntonLapshin/typescript-mysql-model-sample) (incompatible).

## TODO
- [ ] Allow the customization of every `settings` with an `options` object passed to `new TsBuilder()`.
- [ ] Generate `accessers` as seen below.
- [ ] Handle `tinytext` & `mediumint`.

#### Accessers
Example for the product table of Prestashop.

`models/product.ts`:
```typescript
import Knex from 'knex'
import Model from '../helpers/model'
import { IProduct } from '../interfaces/generated/models'

const tableName = 'ps_product'
const idField = 'id_product'

export default class Product extends Model {
  constructor (knex: Knex) {
    super(knex, tableName, idField)
  }
}
```

`helpers/model.ts`:
```typescript
import Knex from 'knex'

export default class Model {
  protected tableName: string
  protected idField: string
  protected selectableProps: string
  protected knex: Knex

  constructor (knex: Knex, tableName: string, idField: string) {
    this.knex = knex
    this.tableName = tableName
    this.idField = idField
    this.selectableProps = '*'
  }

  public async find (filters: any = {}, selectedProps?: string[]): Promise<any[]> {
    return this.knex
      .select(...selectedProps || this.selectableProps)
      .from(this.tableName)
      .where(filters)
  }
}
```

Find a way to propagate the interface / type from `models/product.ts` to `helpers/model.ts`, replacing the `any` in the methods returns definitions.

## License
MIT
