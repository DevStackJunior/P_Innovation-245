import Transaction from '#models/transaction'
import type { HttpContext } from '@adonisjs/core/http'

export default class DecodeQrsController {
  async show({ params, response }: HttpContext) {
    try {
      const format = decodeURIComponent(params.format)

      const qrCode = await Transaction.query()
        .where('format', format)
        .preload('currency')
        .preload('merchant')
        .first()

      return response.ok(qrCode)
    } catch (error) {
      return response.badRequest()
    }
  }
}
