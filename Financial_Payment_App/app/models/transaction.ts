import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Currency from './currency.js'
import Merchant from './merchant.js'
import User from './user.js'

export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare amount: number

  @column()
  declare userId: number

  @column()
  declare merchantId: number

  @column()
  declare currencyId: number

  @column()
  declare status: string

  @column()
  declare description?: string

  @column()
  declare qrCode: string

  @column()
  declare format: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  public user!: BelongsTo<typeof User>

  @belongsTo(() => Merchant)
  public merchant!: BelongsTo<typeof Merchant>

  @belongsTo(() => Currency)
  public currency!: BelongsTo<typeof Currency>

  @hasMany(() => Transaction, { foreignKey: 'fromWalletId' })
  public outgoingTransactions!: HasMany<typeof Transaction>

  @hasMany(() => Transaction, { foreignKey: 'toWalletId' })
  public incomingTransactions!: HasMany<typeof Transaction>
}
