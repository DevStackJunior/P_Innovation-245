import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'wallets'

  async up() {
    this.schema.createTable('wallets', (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.enum('type', ['client', 'merchant']).notNullable()
      table.integer('balance_cents').notNullable().defaultTo(0)
      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}