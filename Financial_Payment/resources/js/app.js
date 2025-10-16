// ===============================================
// APP.JS - GESTION COMMUNE DASHBOARD & PAIEMENT
// ===============================================

;(function () {
  'use strict'

  // Accès global à l'état défini dans common.js
  // state : wallets, transactions, currentScan, scanner, etc.

  document.addEventListener('DOMContentLoaded', init)

  function init() {
    console.log('Initializing app.js')

    // Si on est sur la page pay (scanner)
    if (document.getElementById('reader')) {
      initPaymentPage()
    }

    // Si on est sur dashboard, refresh wallet & tx (en plus de dashboard.js)
    if (document.getElementById('walletTable')) {
      // Le dashboard.js fait ça normalement
      console.log('Dashboard page detected, app.js does not interfere here')
    }

    // Gestion du sélecteur de devise global (présent sur merchant & pay pages)
    const currencySelect = document.getElementById('currencySelect')
    if (currencySelect) {
      currencySelect.addEventListener('change', onCurrencyChange)
      // Initial update display
      updateCurrencyBadge(currencySelect.value)
    }
  }

  // ===========================
  // Paiement - Scanner & Payer
  // ===========================
  async function initPaymentPage() {
    console.log('Initializing payment page with QR scanner')

    const payerBalance = document.getElementById('payerBalance')
    const scanResult = document.getElementById('scanResult')
    const confirmBtn = document.getElementById('confirmBtn')
    const cancelBtn = document.getElementById('cancelBtn')
    const payMsg = document.getElementById('payMsg')
    const showQrCode = document.getElementById('showQrCode')

    let currentPayment = null // infos du paiement extrait du QR

    // Met à jour l'affichage du solde du payeur sélectionné
    function updatePayerBalance() {}

    // Initial balance update
    updatePayerBalance()

    // Initialise le scanner QR (avec library tierce ou simule si pas dispo)
    // Ici on utilise "Html5Qrcode" ou un mock (vu que tu as qrcodejs, mais pas scan, on simule)

    // NOTE: comme tu n'as pas donné le scanner JS, je propose une fonction mock qui demande un code QR
    // Pour une vraie intégration, il faut un scanner QR (ex: https://github.com/mebjas/html5-qrcode)

    // Simuler le scan avec un prompt (exemple temporaire)
    let payload = ''
    async function simulateScan() {
      payload = prompt('Simuler un scan QR (format: LZPAY|merchantId|amount_cents|currency|nonce)')
      if (!payload) {
        resetPaymentUI()
        return
      }
      await processScan(payload)
    }

    // Ici on bind un bouton, mais comme tu as pas de bouton scan, on lance directement simulateScan au chargement
    simulateScan()

    // Traite le contenu scanné du QR
    async function processScan(payload) {
      scanResult.textContent = 'Analyse du QR...'
      payMsg.textContent = ''

      try {
        const res = await fetch(`/api/decodeQr/${payload}`)

        const data = await res.json()

        if (!res.ok) throw new Error('QR code invalide')

        // Stocker les infos de paiement extraites
        currentPayment = {
          to_wallet_id: data.merchant.id,
          amount_cents: data.amount,
          currency: data.currency.code,
          merchant_name: data.merchant.name,
        }

        scanResult.innerHTML = `
          <strong>Commerçant:</strong> ${currentPayment.merchant_name} <br/>
          <strong>Montant:</strong> ${formatAmount(currentPayment.amount_cents, currentPayment.currency)} <br/>
          <strong>Devise QR:</strong> ${currentPayment.currency}
        `
      } catch (err) {
        scanResult.textContent = 'Erreur lors du décodage du QR : ' + err.message
        currentPayment = null
      }
    }

    // Confirmer le paiement
    confirmBtn.addEventListener('click', async () => {
      if (!currentPayment) {
        payMsg.textContent = 'Aucun paiement à confirmer'
        return
      }

      payMsg.textContent = 'Traitement du paiement...'
      confirmBtn.disabled = true
      cancelBtn.disabled = true

      try {
        const to_wallet_id = currentPayment.to_wallet_id
        const amount_cents = currentPayment.amount_cents

        const res = await fetch('/api/pay', {
          method: 'PATCH',
          body: JSON.stringify({
            userId: 1,
            merchantId: 1,
            amount: amount_cents,
            format: payload,
          }),
          headers: { 'Content-Type': 'application/json' },
        })

        if (!res.ok) throw new Error('Erreur lors du paiement')

        payMsg.textContent = 'Paiement effectué avec succès !'
        updatePayerBalance()
        resetPaymentUI()
      } catch (err) {
        payMsg.textContent = 'Erreur paiement : ' + err.message
      } finally {
        confirmBtn.disabled = false
        cancelBtn.disabled = false
      }
    })

    // Annuler le paiement / reset UI
    cancelBtn.addEventListener('click', () => {
      resetPaymentUI()
    })

    // Réinitialise l'interface de paiement
    function resetPaymentUI() {
      scanResult.textContent = ''
      payMsg.textContent = ''
      currentPayment = null
    }
  }

  // ===========================
  // Gestion devise globale
  // ===========================
  function onCurrencyChange(e) {
    const newCurrency = e.target.value
    updateCurrencyBadge(newCurrency)
    // Si besoin, mettre à jour d’autres UI ou valeurs (ex: montant à payer)
  }

  // Met à jour le badge de la devise affichée à côté du montant (ex: page merchant, pay)
  function updateCurrencyBadge(currency) {
    const badge = document.getElementById('amountCurrency')
    if (badge) {
      badge.textContent = currency
    }
  }

  // ===========================
  // Fonction API commune
  // ===========================
  async function api(path, options = {}) {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })

    if (!res.ok) {
      const message = await res.text()
      throw new Error(message || 'Erreur serveur')
    }

    return res.json()
  }

  // ===========================
  // Formatage montant (copie depuis common.js pour s'assurer)
  // ===========================
  function formatAmount(cents, currency) {
    const symbol =
      {
        BAM: 'KM',
        BGN: 'лв',
        HRK: 'kn',
        CZK: 'Kč',
        DKK: 'kr',
        GBP: '£',
        HUF: 'Ft',
        MKD: 'ден',
        NOK: 'kr',
        PLN: 'zł',
        RON: 'lei',
        RSD: 'РСД',
        SEK: 'kr',
        CHF: 'CHF',
        TRY: '₺',
      }[currency] || currency

    const amount = cents

    if (['kr', 'Kč', 'Ft', 'ден', 'zł', 'lei', 'РСД', '₺'].includes(symbol)) {
      return `${amount} ${symbol}`
    } else {
      return `${symbol} ${amount}`
    }
  }

  async function loadTransaction() {
    const res = await fetch(`/api/transactionsShowQrCodeUser/${1}`)
    const data = await res.json()
    showQrCode.src = data.qrCode
  }

  loadTransaction()
})()
