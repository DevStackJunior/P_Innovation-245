const HomeviewsController = () => import('#controllers/homeviews_controller')
const WalletsController = () => import('#controllers/wallets_controller')
const TransactionsController = () => import('#controllers/transactions_controller')
const CurrenciesController = () => import('#controllers/currencies_controller')
const MerchantsviewsController = () => import('#controllers/merchantsviews_controller')
const PayviewsController = () => import('#controllers/payviews_controller')
const DecodeQrsController = () => import('#controllers/decode_qrs_controller')
const PaymentController = () => import('#controllers/payments_controller')
const DashboardviewsController = () => import('#controllers/dashboardviews_controller')
const DatajsonsController = () => import('#controllers/datajsons_controller')
import router from '@adonisjs/core/services/router'

router.get('/', [HomeviewsController, 'index'])
router.get('/pay', [PayviewsController, 'index'])
router.get('/qr_code', [MerchantsviewsController, 'index'])
router.get('/dashboard', [DashboardviewsController, 'index'])

router
  .group(() => {
    // Wallets
    router.resource('wallets', WalletsController).params({ wallets: 'merchantId' }).apiOnly()

    router.resource('decodeQr', DecodeQrsController).params({ decodeQr: 'format' }).apiOnly()

    // Transactions
    router
      .resource('transactions', TransactionsController)
      .params({ transactions: 'merchantId' })
      .apiOnly()
  })
  .prefix('/api')

router
  .group(() => {
    router.get('transactionsShowQrCodeUser/:userId', [TransactionsController, 'showQrcodeUserId'])
    router.get('transactionsshowUserId/:userId', [
      TransactionsController,
      'showAllTransactionsUserId',
    ])

    router.patch('pay', [PaymentController, 'pay'])
    router.get('getDataA', [DatajsonsController, 'getDataA'])
    router.get('getDataB', [DatajsonsController, 'getDataB'])
  })
  .prefix('/api')

// // Payments (paiements & décodage QR)
// router.post('/api/pay', 'PaymentsController.pay')
// router.post('/api/decode-qr', 'PaymentsController.decode')

// Currencies
router.resource('/api/currencies', CurrenciesController).apiOnly()

// // Users
// router.get('/api/users', 'UsersController.index')

// // Merchants
// router.get('/api/merchants', 'MerchantsController.index')
// router.get('/api/merchants/:id', 'MerchantsController.show')

export default router
