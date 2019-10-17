import changeCase from 'change-case'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import Knex from 'knex'
import ncp from 'ncp'
import pluralize from 'pluralize'
import IndexBuilder from './builders/index-builder'
import ClassBuilder from './builders/class-builder'
import InterfaceBuilder from './builders/interface-builder'
import ModelBuilder from './builders/model-builder'
import { IDatabaseSchema, ISetting, ITable } from './interfaces'

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
    classFolder: './classes/',
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
    return this
  }

  public renderDefault () {
    console.log('Generator started')
    if (!existsSync(this.interfaceFullPath())) {
      console.log('Mkdir:' + this.interfaceFullPath())
      mkdirSync(this.interfaceFullPath(), { recursive: true })
    }

    if (!existsSync(this.classFullPath())) {
      console.log('Mkdir:' + this.classFullPath())
      mkdirSync(this.classFullPath(), { recursive: true })
    }

    console.log('Generating files')
    this.renderFiles()
  }

  private interfaceFullPath (): string {
    return this.folder + this.settings.interfaceFolder
  }

  private classFullPath (): string {
    return this.folder + this.settings.classFolder
  }

  private renderFiles () {
    ncp.ncp('code/base/', 'test-build/', (err) => {
      if (err) {
        return console.error(err)
      }
      const tables = this.listTables()
      const tableClasses = this.renderClasses(tables, true)
      this.renderInterfacesFiles(tableClasses)
      this.renderClassFiles(tableClasses)
      this.renderIndexFile(tableClasses)
    })
  }

  private renderInterfacesFiles (tableClasses: ITable[]) {
    const interfaceBuilder = new InterfaceBuilder(this.settings, this.mysqlTypes)
    let interfacesIndex = ''
    tableClasses.forEach((tc) => {
      const definition = interfaceBuilder.renderTs(tc, this.schema.tables[tc.tableName])
      writeFileSync(tc.interfacePath, definition)
      interfacesIndex += `export * from './${tc.importName}'\n`
    })
    const interfacesIndexPath = this.interfaceFullPath() + 'index.ts'
    writeFileSync(interfacesIndexPath, interfacesIndex)
  }

  private renderClassFiles (tableClasses: ITable[]) {
    const classBuilder = new ClassBuilder(this.settings, this.mysqlTypes)
    let classesIndex = ''
    tableClasses.forEach((tc) => {
      const definition = classBuilder.renderTs(tc, this.schema.tables[tc.tableName])
      writeFileSync(tc.classPath, definition)
      classesIndex += `export { default as ${tc.className} } from './${tc.importName}'\n`
    })
    const classesIndexPath = this.classFullPath() + 'index.ts'
    writeFileSync(classesIndexPath, classesIndex)
  }

  private renderIndexFile (tableClasses: ITable[]) {
    const indexBuilder = new IndexBuilder(this.settings, this.mysqlTypes)
    const renderedIndex = indexBuilder.renderTs(tableClasses)
    const classesIndexPath = this.folder + 'index.ts'
    writeFileSync(classesIndexPath, renderedIndex)
  }

  private renderClasses (tables: string[], isTable: boolean): ITable[] {
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
        importName: filename.replace('.ts', ''),
        filename,
        fnName,
        fnPlural,
        interfacePath: this.interfaceFullPath() + filename,
        classPath: this.classFullPath() + filename,
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
    const preI = this.settings.appendIToDeclaration ? 'I' : ''
    return preI + this.getClassName(tableName)
  }

  private getFilenameEnding (): string {
    return '.ts'
  }

  private toFilename (name: string, withExtension?: boolean): string {
    let filename = this.settings.singularizeClassNames ? pluralize.singular(name) : name
    filename = changeCase.snakeCase(filename)
    if (filename.startsWith('ps_')) {
      filename = filename.replace('ps_', '')
    }
    if (!withExtension) return changeCase.snakeCase(filename) + this.getFilenameEnding()
    return changeCase.snakeCase(filename)
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
