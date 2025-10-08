import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('pseudo', 100).notNullable().unique()
      table.string('email', 255).notNullable().unique()
      table.decimal('balance', 10, 2).notNullable().defaultTo(0)
      table.integer('currency_id').unsigned().notNullable()
      table.foreign('currency_id').references('id').inTable('currencies').onDelete('RESTRICT')
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}