import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Wallet from './wallet.js'
import Transaction from './transaction.js'
import User from './user.js'

export default class Currency extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare code: string // e.g., 'CHF', 'EUR', 'USD'

  @column()
  declare name: string // e.g., 'Euro', 'Franc suisse'

  @column()
  declare symbol: string // e.g., '€', 'CHF'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relations (optionnelles mais utiles)

  @hasMany(() => Wallet)
  public wallets!: HasMany<typeof Wallet>

  @hasMany(() => User)
  public users!: HasMany<typeof User>

  @hasMany(() => Transaction)
  public transactions!: HasMany<typeof Transaction>
}
