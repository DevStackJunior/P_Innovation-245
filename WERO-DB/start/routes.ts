/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

router.on('/').render('pages/home')
router.on('/dashboard').render('pages/dashboard')
router.on('/merchant').render('pages/merchant')
router.on('/pay').render('pages/pay')

router.get('/api/wallets', 'PaymentController.wallets')
router.get('/api/transactions', 'PaymentController.transactions')

router.post('/api/pay', 'PaymentController.pay')
router.post('/api/decode-qr', 'PaymentsController.decode')


// ----------------A VERIFIER-------------- 
/*
    - Assignation des routes "CurrenciesController.index"
*/

// Currencies
router.get('currencies', 'CurrenciesController.index')
router.get('currencies/:id', 'CurrenciesController.show')


// Users
router.get('users', 'UsersController.index')

// Wallets
router.get('wallets', 'WalletsController.index')

// Transactions
router.get('transactions', 'TransactionsController.index')
router.post('transactions', 'TransactionsController.store')
router.get('transactions/:id', 'TransactionsController.show')
router.put('transactions/:id', 'TransactionsController.update')
router.patch('transactions/:id', 'TransactionsController.update')