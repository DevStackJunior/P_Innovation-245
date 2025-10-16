import Transaction from '#models/transaction'
import type { HttpContext } from '@adonisjs/core/http'

export default class TransactionsController {
  /**
   * Display a list of resource
   */
  async index({ response, request }: HttpContext) {
    try {
      const transactions = await Transaction.query()
        .preload('currency')
        .preload('user')
        .preload('merchant')
      return response.ok(transactions)
    } catch (error) {
      return response.badRequest()
    }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response }: HttpContext) {
    try {
      const { amount, userId, merchantId, currencyId, status, description, qrCode, format } =
        request.only([
          'amount',
          'userId',
          'merchantId',
          'currencyId',
          'status',
          'description',
          'qrCode',
          'format',
        ])

      const transaction = await Transaction.create({
        amount,
        userId,
        merchantId,
        currencyId,
        status,
        description,
        qrCode,
        format,
      })

      return response.created(transaction)
    } catch (error) {
      return response.badRequest()
    }
  }

  /**
   * Show individual record
   */
  async show({ response, params }: HttpContext) {
    try {
      const merchantId = params.merchantId

      const transaction = await Transaction.query()
        .where('merchant_id', merchantId)
        .preload('currency')
        .preload('user')
        .preload('merchant')

      return response.ok(transaction)
    } catch (error) {
      return response.badRequest()
    }
  }

  async showQrcodeUserId({ response, params }: HttpContext) {
    try {
      const userId = params.userId

      const transaction = await Transaction.query()
        .where('user_id', userId)
        .orderBy('created_at', 'desc')
        .first()

      return response.ok(transaction)
    } catch (error) {
      return response.badRequest()
    }
  }

  async showAllTransactionsUserId({ response, params }: HttpContext) {
    try {
      const userId = params.userId

      const transaction = await Transaction.query()
        .where('user_id', userId)
        .orderBy('created_at', 'desc')

      return response.ok(transaction)
    } catch (error) {
      return response.badRequest()
    }
  }

  /**
   * Edit individual record
   */
  async edit({ params }: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {}
}
