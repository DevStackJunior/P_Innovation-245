import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Currency from './currency.js'
import Transaction from './transaction.js'

export default class Wallet extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare userId: number

  @column()
  declare currencyId: number

  @column()
  declare balance_cents: number

  @column()
  declare type: 'client' | 'merchant' // 👈 Ajout de ce champ

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  public user!: BelongsTo<typeof User>

  @belongsTo(() => Currency)
  public currency!: BelongsTo<typeof Currency>

  @hasMany(() => Transaction, { foreignKey: 'fromWalletId' })
  public outgoingTransactions!: HasMany<typeof Transaction>

  @hasMany(() => Transaction, { foreignKey: 'toWalletId' })
  public incomingTransactions!: HasMany<typeof Transaction>
}
