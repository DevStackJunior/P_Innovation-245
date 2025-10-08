import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'merchants'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name', 255).notNullable()
      table.string('address', 255).notNullable()
      table.string('city', 100).notNullable()
      table.string('postal_code', 20).nullable()
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