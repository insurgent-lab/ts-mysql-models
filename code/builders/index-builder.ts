import { readFileSync } from 'fs'
import Handlebars from 'handlebars'
import { IDatabaseTable, ISetting, ITable } from '../interfaces'

import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

/* tslint:disable */
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
/* tslint:enable */

const indexTemplate = Handlebars.compile(readFileSync(join(__dirname, '../templates/index.tpl'), { encoding: 'utf-8' }))

export default class IndexBuilder {
  constructor (private settings: ISetting, private mysqlTypes: { [key: string]: string }) { }

  public renderTs (tableClasses: ITable[]): string {
    return indexTemplate({ tableClasses })
  }
}
