import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'currencies'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('code', 3).notNullable().unique() // CHF, EUR, GBP, etc.
      table.string('name', 100).notNullable() // Franc suisse, Euro, etc.
      table.string('symbol', 10).notNullable() // CHF, €, £, etc.
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}