import changeCase from 'change-case'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import Knex from 'knex'
import pluralize from 'pluralize'
import InterfaceBuilder from './builders/interface-builder'
import { ISetting, IDatabaseSchema, ITable } from './interfaces'
import ModelBuilder from './builders/model-builder'

export default class TsBuilder {
  public static async init (knex: Knex, folder: string): Promise<TsBuilder> {
    return new TsBuilder(folder).init(knex)
  }

  public static async runDefault (knex: Knex, folder: string) {
    const builder = await TsBuilder.init(knex, folder)
    builder.renderDefault()
  }

  private static normFolder (folder: string): string {
    if (!folder) {
      return ''
    }
    if (!(folder.endsWith('/') || folder.endsWith('\\'))) {
      folder += '/'
    }
    return folder
  }

  public readonly mysqlTypes = {
    blob: 'any',
    bigint: 'number',
    char: 'string',
    date: 'Date',
    datetime: 'Date',
    decimal: 'number',
    double: 'number',
    float: 'number',
    int: 'number',
    longblob: 'any',
    longtext: 'string',
    mediumtext: 'string',
    set: 'string',
    smallint: 'number',
    text: 'string',
    timestamp: 'Date | string',
    tinyint: 'boolean',
    varchar: 'string',
    enum: 'enum',
  }

  public settings: ISetting = {
    appendIToDeclaration: true,
    appendIToFileName: true,
    camelCaseFnNames: true,
    defaultClassModifier: 'export interface',
    interfaceFolder: './interfaces/',
    optionalParameters: true,
    singularizeClassNames: true,
    suffixGeneratedToFilenames: true,
  }

  private folder: string
  private schema!: IDatabaseSchema
  constructor (folder: string, schema?: IDatabaseSchema) {
    this.folder = TsBuilder.normFolder(folder)
    if (schema) {
      this.schema = schema
    }
  }

  public getTypeMap (): Map<string, string> {
    const map = new Map<string, string>()
    Object.keys(this.mysqlTypes).forEach((key: string) => map.set(key, (this.mysqlTypes as any)[key]))
    return map
  }

  public async init (knex: Knex, dbName?: string): Promise<TsBuilder> {
    const builder = new ModelBuilder(knex, dbName)
    this.schema = await builder.renderDatabaseSchema()
    console.log(this.schema)
    return this
  }

  public renderDefault () {
    console.log('Generator started')
    if (!existsSync(this.intefaceFullPath())) {
      console.log('Mdir:' + this.intefaceFullPath())
      mkdirSync(this.intefaceFullPath(), { recursive: true })
    }

    console.log('Generating class files')
    this.renderClassFiles()
  }

  private intefaceFullPath (): string {
    return this.folder + this.settings.interfaceFolder
  }

  private renderClassFiles () {
    const tables = this.listTables()
    const tableClasses = this.renderClasses(tables, this.intefaceFullPath(), true)
    const interfaceBuilder = new InterfaceBuilder(this.settings, this.mysqlTypes)
    tableClasses.forEach((tc) => {
      const definition = interfaceBuilder.renderTs(tc, this.schema.tables[tc.tableName])
      writeFileSync(tc.fullPath, definition)
    })
  }

  private renderClasses (tables: string[], folder: string, isTable: boolean): ITable[] {
    return tables.map((t) => {
      let fnName: string
      let fnPlural: string
      const className = this.getClassName(t)
      fnName = changeCase.pascalCase(className)
      fnPlural = changeCase.pascalCase(t)

      const filename = this.toFilename(t)
      return {
        className: this.getClassName(t),
        prefixedClassName: this.getPrefixedClassName(t),
        filename,
        fnName,
        fnPlural,
        fullPath: folder + filename,
        tableName: t,
        isTable,
      }
    })
  }

  private listTables () {
    return Object.keys(this.schema.tables)
  }

  private getClassName (tableName: string): string {
    const className = this.settings.singularizeClassNames ? pluralize.singular(tableName) : tableName
    return changeCase.pascalCase(className.replace(/ps_/g, ''))
  }

  private getPrefixedClassName (tableName: string): string {
    const preI = this.settings.appendIToDeclaration ? 'IModel' : ''
    return preI + this.getClassName(tableName)
  }

  private getFilenameEnding (): string {
    return '.ts'
  }

  private toFilename (name: string): string {
    let filename = this.settings.singularizeClassNames ? pluralize.singular(name) : name
    filename = changeCase.snakeCase(filename)
    if (filename.startsWith('ps_')) {
      filename = filename.replace('ps_', '')
    }
    return changeCase.snakeCase(filename) + this.getFilenameEnding()
  }
}

async function build () {
  // Create a knex instance
  const knex = Knex({
    client: 'mysql',
    connection: {
      host: 'db',
      user: 'admin',
      password: 'password',
      database: 'brico',
    },
  })

  const tsBuilder = await new TsBuilder('./test-build').init(knex)
  tsBuilder.renderDefault()
  knex.destroy()
}

build()
  .catch((e) => console.error(e))