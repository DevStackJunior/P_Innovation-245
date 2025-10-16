import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Currency from './currency.js'
import Transaction from './transaction.js'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare pseudo: string

  @column()
  declare email: string

  @column()
  declare balance: number

  @column()
  declare currencyId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Currency)
  public currency!: BelongsTo<typeof Currency>

  // Optionnel : liste des transactions faites par l'utilisateur
  @hasMany(() => Transaction)
  public transactions!: HasMany<typeof Transaction>
}
