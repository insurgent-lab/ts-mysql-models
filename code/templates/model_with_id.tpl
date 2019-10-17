import Knex from 'knex'
import { I{{className}} } from '../interfaces'

const tableName = '{{tableName}}'
const idField = '{{idField}}'

export default class {{className}} {
  protected selectableProps: string
  protected knex: Knex

  constructor (knex: Knex) {
    this.knex = knex
    this.selectableProps = '*'
  }

  public async insert (props: I{{className}} | I{{className}}[]): Promise<number> {
    delete props[idField] // not allowed to set `id`

    const [ itemId ]: number[] = await this.knex
      .insert(props)
      .into(tableName)

    return itemId
  }

  public async find (filters: any = { }, selectedProps?: string[]): Promise<I{{className}}[]> {
    return this.knex
      .select(...selectedProps || this.selectableProps)
      .from(tableName)
      .where(filters)
  }

  public async findById (id: number, selectedProps?: string[]): Promise<I{{className}}> {
    const items = await this.knex
      .select(...selectedProps || this.selectableProps)
      .from(tableName)
      .where({ [idField]: id })

    return items[0]
  }

  public async findOne (filters: any = { }, selectedProps?: string[]): Promise<I{{className}}> {
    const items = await this.knex
      .select(...selectedProps || this.selectableProps)
      .from(tableName)
      .where(filters)
      .limit(1)
    return items[0]
  }

  public async findAll (selectedProps?: string[]): Promise<I{{className}}[]> {
    return this.knex
      .select(...selectedProps || this.selectableProps)
      .from(tableName)
  }

  public async list (field?: string, filters: any = { }): Promise<any[]> {
    const list = this.knex
      .distinct()
      .from(tableName)
      .where(filters)
      .pluck(field || idField) as unknown as any[]

    return list
  }

  public async count (field: string, filters: any = { }): Promise<number> {
    const res = await this.knex
      .count({ count: field })
      .from(tableName)
      .where(filters) as unknown as Array<{ count: number}>

    return Number(res[0].count)
  }

  public async exists (filters: any = { }): Promise<boolean> {
    const res = await this.knex
      .count({ count: '*' })
      .from(tableName)
      .where(filters) as unknown as Array<{ count: number}>

    if (res[0].count > 0) return true
    return false
  }

  public async existsById (id: number): Promise<boolean> {
    const res = await this.knex
      .count({ count: idField })
      .from(tableName)
      .where({ [idField]: id }) as unknown as Array<{ count: number}>

    if (res[0].count > 0) return true
    return false
  }

  public async max (field: string, filters: any = { }): Promise<number> {
    const res = await this.knex
      .max({ max: field })
      .from(tableName)
      .where(filters) as unknown as Array<{ max: number}>

    return Number(res[0].max)
  }

  public async update (filters: any = { }, props: any): Promise<any> {
    delete props[idField] // not allowed to set `id`

    return this.knex.update(props)
      .from(tableName)
      .where(filters)
  }

  public async updateById (id: number, props: any): Promise<any> {
    delete props[idField] // not allowed to set `id`

    return this.knex.update(props)
      .from(tableName)
      .where({ [idField]: id })
  }

  public async delete (filters: any = { }): Promise<any> {
    return this.knex.delete()
      .from(tableName)
      .where(filters)
  }

  public async deleteById (id: number): Promise<any> {
    return this.knex.delete()
      .from(tableName)
      .where({ [idField]: id })
  }
}
