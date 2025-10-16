// ===============================================
// COMMON.JS - FONCTIONS ET DONNÉES PARTAGÉES
// ===============================================

// Configuration des devises supportées
export const CURRENCIES = {
  BAM: { name: 'Mark convertible de Bosnie', symbol: 'KM', rate: 1.96 },
  BGN: { name: 'Lev bulgare', symbol: 'лв', rate: 1.96 },
  HRK: { name: 'Kuna croate', symbol: 'kn', rate: 7.53 },
  CZK: { name: 'Couronne tchèque', symbol: 'Kč', rate: 25.4 },
  DKK: { name: 'Couronne danoise', symbol: 'kr', rate: 7.46 },
  GBP: { name: 'Livre sterling', symbol: '£', rate: 0.86 },
  HUF: { name: 'Forint hongrois', symbol: 'Ft', rate: 390.5 },
  MKD: { name: 'Denar macédonien', symbol: 'ден', rate: 61.6 },
  NOK: { name: 'Couronne norvégienne', symbol: 'kr', rate: 11.85 },
  PLN: { name: 'Zloty polonais', symbol: 'zł', rate: 4.32 },
  RON: { name: 'Nouveau leu roumain', symbol: 'lei', rate: 4.98 },
  RSD: { name: 'Dinar serbe', symbol: 'РСД', rate: 117.25 },
  SEK: { name: 'Couronne suédoise', symbol: 'kr', rate: 11.6 },
  CHF: { name: 'Franc suisse', symbol: 'CHF', rate: 0.93 },
  TRY: { name: 'Livre turque', symbol: '₺', rate: 32.5 },
}

const BASE_CURRENCY = 'EUR'
const BASE_RATE = 1.0

// Mock data
const mockWallets = [
  { id: 1, name: 'Alice', type: 'customer', balance_cents: 15000, currencyId: 'CHF' },
  { id: 2, name: 'Bruno', type: 'customer', balance_cents: 8000, currencyId: 'EUR' },
  { id: 3, name: 'Camille', type: 'customer', balance_cents: 2500, currencyId: 'GBP' },
  { id: 4, name: 'Café de la Gare', type: 'merchant', balance_cents: 0, currencyId: 'CHF' },
  { id: 5, name: 'Boutique Léman', type: 'merchant', balance_cents: 0, currencyId: 'EUR' },
  { id: 6, name: 'Musée Cantonal', type: 'merchant', balance_cents: 0, currencyId: 'NOK' },
]

const mockTransactions = []

// État global de l'application
const state = {
  wallets: [...mockWallets],
  transactions: [...mockTransactions],
  currentScan: null,
  scanner: null,
  qrCodeInstance: null,
  selectedCurrency: 'CHF',
}

// ===============================================
// FONCTIONS UTILITAIRES
// ===============================================

// Conversion entre devises (tout passe par EUR comme référence)
function convertCurrency(amountCents, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return amountCents

  let eurCents
  if (fromCurrency === BASE_CURRENCY) {
    eurCents = amountCents
  } else {
    const fromRate = CURRENCIES[fromCurrency]?.rate || 1
    eurCents = Math.round(amountCents / fromRate)
  }

  if (toCurrency === BASE_CURRENCY) {
    return eurCents
  } else {
    const toRate = CURRENCIES[toCurrency]?.rate || 1
    return Math.round(eurCents * toRate)
  }
}

// Formatage des montants avec devise
function formatAmount(cents, currency) {
  const symbol = CURRENCIES[currency]?.symbol || currency
  const amount = (cents / 100).toFixed(2)

  if (['kr', 'Kč', 'Ft', 'ден', 'zł', 'lei', 'РСД', '₺'].includes(symbol)) {
    return `${amount} ${symbol}`
  } else {
    return `${symbol} ${amount}`
  }
}

// Fonction de compatibilité
const CHF = (cents, currency = 'CHF') => formatAmount(cents, currency)

// Générer un nonce unique
function makeNonce() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ===============================================
// API MOCK - SIMULATION DES APPELS SERVEUR
// ===============================================

async function api(path, options = {}) {
  // Pour simuler la latence serveur
  await new Promise((resolve) => setTimeout(resolve, 100))

  if (path === '/api/wallets') {
    return state.wallets
  }

  if (path === '/api/transactions') {
    // Renvoie les 10 dernières transactions, ordre inverse
    return state.transactions.slice(-10).reverse()
  }

  if (path === '/api/currencies') {
    return {
      currencies: CURRENCIES,
      baseCurrency: BASE_CURRENCY,
    }
  }

  if (path === '/api/pay' && options.method === 'POST') {
    const data = JSON.parse(options.body)
    const { from_wallet_id, to_wallet_id, amount_cents, note, qr_nonce, original_currency } = data

    const fromWallet = state.wallets.find((w) => w.id === from_wallet_id)
    const toWallet = state.wallets.find((w) => w.id === to_wallet_id)

    if (!fromWallet || !toWallet) {
      throw new Error('Wallet not found')
    }

    const amountInPayerCurrency = convertCurrency(
      amount_cents,
      original_currency,
      fromWallet.currencyId
    )

    if (fromWallet.balance_cents < amountInPayerCurrency) {
      throw new Error('Insufficient funds')
    }

    const amountInReceiverCurrency = convertCurrency(
      amount_cents,
      original_currency,
      toWallet.currencyId
    )

    fromWallet.balance_cents -= amountInPayerCurrency
    toWallet.balance_cents += amountInReceiverCurrency

    const tx = {
      id: state.transactions.length + 1,
      ts: new Date().toISOString(),
      from_wallet_id,
      to_wallet_id,
      amount_cents,
      original_currency,
      from_currency: fromWallet.currencyId,
      to_currency: toWallet.currencyId,
      from_amount_cents: amountInPayerCurrency,
      to_amount_cents: amountInReceiverCurrency,
      note,
      qr_nonce,
      // Optionnel: tu peux rajouter from_name et to_name si tu veux des infos complémentaires dans le mock
      // from_name: fromWallet.name,
      // to_name: toWallet.name
    }

    state.transactions.push(tx)

    return { ok: true, tx }
  }

  if (path === '/api/decode-qr' && options.method === 'POST') {
    const data = JSON.parse(options.body)
    const payload = data.payload
    const parts = payload.split('|')

    if (parts[0] !== 'LZPAY' || parts.length < 5) {
      throw new Error('Invalid QR code format')
    }

    const [, merchantId, amountCentsStr, currency, nonce] = parts
    const to_wallet_id = Number(merchantId)
    const amount_cents = Number(amountCentsStr)

    // Recherche par type 'merchant' (et pas 'kind')
    const merchant = state.wallets.find((w) => w.id === to_wallet_id && w.type === 'merchant')

    if (!merchant) {
      throw new Error('Unknown merchant')
    }

    if (!CURRENCIES[currency] && currency !== BASE_CURRENCY) {
      throw new Error('Unsupported currency')
    }

    return {
      ok: true,
      to_wallet_id,
      amount_cents,
      currency,
      merchant_name: merchant.name,
      merchant_currency: merchant.currencyId,
      nonce,
    }
  }

  throw new Error('Unknown API endpoint')
}
