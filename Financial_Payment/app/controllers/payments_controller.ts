import Transaction from '#models/transaction'
import { HttpContext } from '@adonisjs/core/http'

export default class PaymentController {
  public async pay({ request, response }: HttpContext) {
    const { userId, merchantId, amount, format } = request.only([
      'userId',
      'merchantId',
      'amount',
      'format',
    ])
    console.log(userId, merchantId, amount)

    if (amount <= 0) {
      return response.badRequest('Amount must be greater than zero')
    }

    try {
      // const userWallet = await Wallet.query().where('id', userId).andWhere('type', 'client').first()

      // const merchantWallet = await Wallet.query()
      //   .where('id', 3)
      //   .andWhere('type', 'merchant')
      //   .first()

      // if (!userWallet || !merchantWallet) {
      //   return response.notFound({ error: 'Wallets not found' })
      // }

      // const amountCents = Math.round(Number(amount) * 100)

      // userWallet.balance_cents -= amountCents
      // merchantWallet.balance_cents += amountCents

      // await userWallet.save()
      // await merchantWallet.save()

      const transaction = await Transaction.query()
        .where('user_id', 1)
        .where('merchant_id', 1)
        .where('format', format)
        .first()

      console.log('transaction', transaction)

      if (!transaction) {
        return response.notFound({ error: 'Transaction not found' })
      }

      transaction.merge({
        status: 'completed',
        description: 'Paiement effectué via QR code',
      })

      await transaction.save()

      console.log('fin')

      return response.noContent()
    } catch (error) {
      console.error('Transaction error:', error)
      return response.internalServerError('Transaction failed')
    }
  }
}
