import Transaction from '#models/transaction'
import User from '#models/user'
import Merchant from '#models/merchant'
import Currency from '#models/currency'
import { HttpContext } from '@adonisjs/core/http'

export default class PaymentController {
  public async pay({ request, response }: HttpContext) {
    const {
      userId,
      merchantId,
      currencyId,
      amount,
      description,
      qr_code,
    } = request.only([
      'userId',
      'merchantId',
      'currencyId',
      'amount',
      'description',
      'qr_code',
    ])

    if (amount <= 0) {
      return response.badRequest('Amount must be greater than zero')
    }

    try {
      // Vérifie que les entités existent
      await User.findOrFail(userId)
      await Merchant.findOrFail(merchantId)
      await Currency.findOrFail(currencyId)

      const transaction = await Transaction.create({
        userId,
        merchantId,
        currencyId,
        amount,
        description,
        status: 'completed', // ou 'pending' selon logique métier
        qrCode: qr_code,
      })

      return response.ok({
        message: 'Transaction completed',
        transaction,
      })
    } catch (error) {
      console.error('Transaction error:', error)
      return response.internalServerError('Transaction failed')
    }
  }
}
