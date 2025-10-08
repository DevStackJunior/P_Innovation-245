import router from '@adonisjs/core/services/router'

// Pages statiques
router.on('/').render('pages/home')
router.on('/dashboard').render('pages/dashboard')
router.on('/merchant').render('pages/merchant')
router.on('/pay').render('pages/pay')

// --- API ---

// Wallets
router.get('/api/wallets', 'WalletsController.index')

// Transactions
router.get('/api/transactions', 'TransactionsController.index')
router.post('/api/transactions', 'TransactionsController.store')
router.get('/api/transactions/:id', 'TransactionsController.show')
router.put('/api/transactions/:id', 'TransactionsController.update')
router.patch('/api/transactions/:id', 'TransactionsController.update')

// Payments (paiements & décodage QR)
router.post('/api/pay', 'PaymentsController.pay')
router.post('/api/decode-qr', 'PaymentsController.decode')

// Currencies
router.get('/api/currencies', 'CurrenciesController.index')
router.get('/api/currencies/:id', 'CurrenciesController.show')

// Users
router.get('/api/users', 'UsersController.index')

// Merchants
router.get('/api/merchants', 'MerchantsController.index')
router.get('/api/merchants/:id', 'MerchantsController.show')

export default router
