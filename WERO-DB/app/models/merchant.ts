import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Currency from './currency.js'
import Transaction from './transaction.js'

export default class Merchant extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare address: string

  @column()
  declare city: string

  @column()
  declare postal_code?: string | null

  @column()
  declare balance: number

  @column()
  declare currency_id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Currency)
  public currency!: BelongsTo<typeof Currency>

  @hasMany(() => Transaction)
  public transactions!: HasMany<typeof Transaction>
}
