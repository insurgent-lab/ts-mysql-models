import Knex from 'knex'
import { I{{className}} } from '../interfaces'

const tableName = '{{tableName}}'
const idField = '{{idField}}'

export default class {{className}} {
  protected tableName: string
  protected idField: string
  protected selectableProps: string
  protected knex: Knex

  constructor (knex: Knex) {
    this.knex = knex
    this.tableName = tableName
    this.idField = idField
    this.selectableProps = '*'
  }

  public async insert (props: I{{className}} | I{{className}}[]): Promise<number> {
    delete props[this.idField] // not allowed to set `id`

    const [ itemId ]: number[] = await this.knex
      .insert(props)
      .into(this.tableName)

    return itemId
  }

  public async find (filters: any = { }, selectedProps?: string[]): Promise<I{{className}}[]> {
    return this.knex
      .select(...selectedProps || this.selectableProps)
      .from(this.tableName)
      .where(filters)
  }

  public async findById (id: number, selectedProps?: string[]): Promise<I{{className}}> {
    const items = await this.knex
      .select(...selectedProps || this.selectableProps)
      .from(this.tableName)
      .where({ [this.idField]: id })

    return items[0]
  }

  public async findOne (filters: any = { }, selectedProps?: string[]): Promise<I{{className}}> {
    const items = await this.knex
      .select(...selectedProps || this.selectableProps)
      .from(this.tableName)
      .where(filters)
      .limit(1)
    return items[0]
  }

  public async findAll (selectedProps?: string[]): Promise<I{{className}}[]> {
    return this.knex
      .select(...selectedProps || this.selectableProps)
      .from(this.tableName)
  }

  public async list (field?: string, filters: any = { }): Promise<any[]> {
    const list = this.knex
      .distinct()
      .from(this.tableName)
      .where(filters)
      .pluck(field || this.idField) as unknown as any[]

    return list
  }

  public async count (field: string, filters: any = { }): Promise<number> {
    const res = await this.knex
      .count({ count: field })
      .from(this.tableName)
      .where(filters) as unknown as Array<{ count: number}>

    return Number(res[0].count)
  }

  public async exists (filters: any = { }): Promise<boolean> {
    const res = await this.knex
      .count({ count: '*' })
      .from(this.tableName)
      .where(filters) as unknown as Array<{ count: number}>

    if (res[0].count > 0) return true
    return false
  }

  public async existsById (id: number): Promise<boolean> {
    const res = await this.knex
      .count({ count: this.idField })
      .from(this.tableName)
      .where({ [this.idField]: id }) as unknown as Array<{ count: number}>

    if (res[0].count > 0) return true
    return false
  }

  public async max (field: string, filters: any = { }): Promise<number> {
    const res = await this.knex
      .max({ max: field })
      .from(this.tableName)
      .where(filters) as unknown as Array<{ max: number}>

    return Number(res[0].max)
  }

  public async update (filters: any = { }, props: any): Promise<any> {
    delete props[this.idField] // not allowed to set `id`

    return this.knex.update(props)
      .from(this.tableName)
      .where(filters)
  }

  public async updateById (id: number, props: any): Promise<any> {
    delete props[this.idField] // not allowed to set `id`

    return this.knex.update(props)
      .from(this.tableName)
      .where({ [this.idField]: id })
  }

  public async delete (filters: any = { }): Promise<any> {
    return this.knex.delete()
      .from(this.tableName)
      .where(filters)
  }

  public async deleteById (id: number): Promise<any> {
    return this.knex.delete()
      .from(this.tableName)
      .where({ [this.idField]: id })
  }
}
