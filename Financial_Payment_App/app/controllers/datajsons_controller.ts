import Transaction from '#models/transaction'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import fs from 'node:fs'

export default class DatajsonsController {
  public async getDataA({ response }: HttpContext) {
    try {
      const filePath = app.makePath('app', 'data', 'a.json')
      const rawData = fs.readFileSync(filePath, 'utf-8')

      const data = JSON.parse(rawData)

      const createdTransactions = await Transaction.createMany(data)

      return response.ok({
        message: `${createdTransactions.length} transactions importées avec succès ✅`,
        transactions: createdTransactions,
      })
    } catch (error) {
      console.error('Erreur lecture data.json:', error)
      return response.status(500).json({ error: 'Impossible de charger les données' })
    }
  }

  public async getDataB({ response }: HttpContext) {
    try {
      const filePath = app.makePath('app', 'data', 'b.json')
      const rawData = fs.readFileSync(filePath, 'utf-8')

      const data = JSON.parse(rawData)

      const createdTransactions = await Transaction.createMany(data)

      return response.ok({
        message: `${createdTransactions.length} transactions importées avec succès ✅`,
        transactions: createdTransactions,
      })
    } catch (error) {
      console.error('Erreur lecture data.json:', error)
      return response.status(500).json({ error: 'Impossible de charger les données' })
    }
  }
}
