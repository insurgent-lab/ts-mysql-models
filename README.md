# Typescript MySQL Models

This is an attempt to auto generate a boilerplate for projects using [TypeScript](https://github.com/Microsoft/TypeScript) in combination with MySQL. Generating interfaces, entities and ORM-like methods allowes the IDE to provide auto-completion and compile time error handling. This project heavily relies on [Knex](https://github.com/tgriesser/knex).

# WARNING: This is being reworked, please wait a bit because it is unstable for now.

## Examples
- [Example generation project](https://github.com/AntonLapshin/typescript-mysql-model-sample) (:warning: incompatible :warning:)
- [Example resulting library]() (:warning: missing :warning:)

## TODO
- [x] Implement Interfaces.
- [x] Implement Models.
- [x] Find a way to add / override methods for a table (see below).
- [ ] Rework Models as a base mixin class to be extended by table models.
- [ ] Make `tableName` and `idField` static properties and fetch them from a constant file so we can update them without regenerating the Models extend files.
- [ ] Allow for custom methods by generating the Models extend files only the first time (so they can be modified). 
- [ ] Implement Entities.
- [ ] `this.selectableProps` type should be an enum of the fields, so if we update the interfaces (when updating database schema) the lib won't compile trying to fetch a non-existent field.
- [ ] When updating database schema and new fields are added (try to make a diff), log to the user that they should probably be added to `this.selectableProps`.
- [ ] Handle `tinytext` & `mediumint`.
- [ ] Allow the customization of every `settings` with an `options` object passed to `new TsBuilder()`.

## License
MIT
