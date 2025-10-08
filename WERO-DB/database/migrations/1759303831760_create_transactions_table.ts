import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.decimal('amount', 10, 2).notNullable()
      table.integer('user_id').unsigned().notNullable()
      table.integer('merchant_id').unsigned().notNullable()
      table.integer('currency_id').unsigned().notNullable()
      table.string('status', 20).notNullable().defaultTo('completed') // completed, pending, failed
      table.text('description').nullable()
      
      table.string('qr_nonce', 255).index()

      // Foreign keys
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.foreign('merchant_id').references('id').inTable('merchants').onDelete('CASCADE')
      table.foreign('currency_id').references('id').inTable('currencies').onDelete('RESTRICT')
      
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}