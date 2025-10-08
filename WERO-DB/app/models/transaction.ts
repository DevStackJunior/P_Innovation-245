import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Merchant from './merchant.js'
import Currency from './currency.js'

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
  public qrCode?: string

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
