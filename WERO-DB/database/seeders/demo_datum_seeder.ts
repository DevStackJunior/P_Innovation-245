import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Database from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    // Insérer des utilisateurs de test
    await Database.table('users').multiInsert([
      {
        pseudo: 'Alice',
        email: 'alice@example.com',
        balance: 150.00,
        currency_id: 1, // CHF
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        pseudo: 'Bruno',
        email: 'bruno@example.com',
        balance: 80.00,
        currency_id: 2, // EUR
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        pseudo: 'Camille',
        email: 'camille@example.com',
        balance: 25.00,
        currency_id: 3, // GBP
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])

    // Insérer des commerçants de test
    await Database.table('merchants').multiInsert([
      {
        name: 'Café de la Gare',
        address: 'Place de la Gare 1',
        city: 'Lausanne',
        postal_code: '1003',
        balance: 0.00,
        currency_id: 1, // CHF
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Boutique Léman',
        address: 'Rue du Léman 15',
        city: 'Lausanne',
        postal_code: '1005',
        balance: 0.00,
        currency_id: 2, // EUR
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Musée Cantonal',
        address: 'Palais de Rumine',
        city: 'Lausanne',
        postal_code: '1014',
        balance: 0.00,
        currency_id: 4, // NOK
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
  }
}