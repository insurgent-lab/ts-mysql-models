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
- [ ] Find a way to add / override methods for a table.
- [ ] Handle `tinytext` & `mediumint`.
- [ ] Allow the customization of every `settings` with an `options` object passed to `new TsBuilder()`.

## License
MIT
