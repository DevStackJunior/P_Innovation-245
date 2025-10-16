import Wallet from '#models/wallet'
import { BaseSeeder } from '@adonisjs/lucid/seeders'


export default class extends BaseSeeder {
  async run() {
      await Wallet.createMany([
      { name: 'Alice', type: 'client', balance_cents: 100000 }, // 1000 CHF
      { name: 'Bruno', type: 'client', balance_cents: 50000 },
      { name: 'Café de la Gare', type: 'merchant', balance_cents: 0 },
    ])
  }
}
