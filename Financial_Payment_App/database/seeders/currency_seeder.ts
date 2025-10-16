import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Database from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    await Database.table('currencies').multiInsert([
      {
        code: 'CHF',
        name: 'Franc suisse',
        symbol: 'CHF',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'GBP',
        name: 'Livre sterling',
        symbol: '£',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'NOK',
        name: 'Couronne norvégienne',
        symbol: 'kr',
        created_at: new Date(),
        updated_at: new Date(),
      },      
    ])
  }
}