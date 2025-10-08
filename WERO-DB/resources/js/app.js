// ===============================================
// APP.JS - GESTION COMMUNE DASHBOARD & PAIEMENT
// ===============================================

(function() {
  'use strict';

  // Accès global à l'état défini dans common.js
  // state : wallets, transactions, currentScan, scanner, etc.

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    console.log('Initializing app.js');

    // Si on est sur la page pay (scanner)
    if (document.getElementById('reader')) {
      initPaymentPage();
    }

    // Si on est sur dashboard, refresh wallet & tx (en plus de dashboard.js)
    if (document.getElementById('walletTable')) {
      // Le dashboard.js fait ça normalement
      console.log('Dashboard page detected, app.js does not interfere here');
    }

    // Gestion du sélecteur de devise global (présent sur merchant & pay pages)
    const currencySelect = document.getElementById('currencySelect');
    if (currencySelect) {
      currencySelect.addEventListener('change', onCurrencyChange);
      // Initial update display
      updateCurrencyBadge(currencySelect.value);
    }
  }

  // ===========================
  // Paiement - Scanner & Payer
  // ===========================
  async function initPaymentPage() {
    console.log('Initializing payment page with QR scanner');

    const payerSelect = document.getElementById('payerSelect');
    const payerBalance = document.getElementById('payerBalance');
    const readerElem = document.getElementById('reader');
    const scanResult = document.getElementById('scanResult');
    const actionRow = document.getElementById('actionRow');
    const confirmBtn = document.getElementById('confirmBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const payMsg = document.getElementById('payMsg');
    const currencySelect = document.getElementById('currencySelect');

    if (!payerSelect || !payerBalance || !readerElem || !scanResult || !actionRow || !confirmBtn || !cancelBtn || !payMsg) {
      console.warn('Payment page elements missing');
      return;
    }

    let currentPayment = null; // infos du paiement extrait du QR

    // Met à jour l'affichage du solde du payeur sélectionné
    function updatePayerBalance() {
      const payerId = Number(payerSelect.value);
      const wallet = state.wallets.find(w => w.id === payerId);
      if (!wallet) {
        payerBalance.textContent = '—';
        return;
      }
      payerBalance.textContent = formatAmount(wallet.balance_cents, wallet.currency);
    }

    payerSelect.addEventListener('change', () => {
      updatePayerBalance();
      resetPaymentUI();
    });

    // Initial balance update
    updatePayerBalance();

    // Initialise le scanner QR (avec library tierce ou simule si pas dispo)
    // Ici on utilise "Html5Qrcode" ou un mock (vu que tu as qrcodejs, mais pas scan, on simule)

    // NOTE: comme tu n'as pas donné le scanner JS, je propose une fonction mock qui demande un code QR
    // Pour une vraie intégration, il faut un scanner QR (ex: https://github.com/mebjas/html5-qrcode)

    // Simuler le scan avec un prompt (exemple temporaire)
    async function simulateScan() {
      const payload = prompt('Simuler un scan QR (format: LZPAY|merchantId|amount_cents|currency|nonce)');
      if (!payload) {
        resetPaymentUI();
        return;
      }
      await processScan(payload);
    }

    // Ici on bind un bouton, mais comme tu as pas de bouton scan, on lance directement simulateScan au chargement
    simulateScan();

    // Traite le contenu scanné du QR
    async function processScan(payload) {
      scanResult.textContent = 'Analyse du QR...';
      payMsg.textContent = '';
      actionRow.classList.add('hidden');

      try {
        const res = await api('/api/decode-qr', {
          method: 'POST',
          body: JSON.stringify({ payload }),
          headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) throw new Error('QR code invalide');

        // Stocker les infos de paiement extraites
        currentPayment = {
          to_wallet_id: res.to_wallet_id,
          amount_cents: res.amount_cents,
          currency: res.currency,
          merchant_name: res.merchant_name,
          nonce: res.nonce
        };

        scanResult.innerHTML = `
          <strong>Commerçant:</strong> ${currentPayment.merchant_name} <br/>
          <strong>Montant:</strong> ${formatAmount(currentPayment.amount_cents, currentPayment.currency)} <br/>
          <strong>Devise QR:</strong> ${currentPayment.currency}
        `;

        actionRow.classList.remove('hidden');

      } catch (err) {
        scanResult.textContent = 'Erreur lors du décodage du QR : ' + err.message;
        currentPayment = null;
      }
    }

    // Confirmer le paiement
    confirmBtn.addEventListener('click', async () => {
      if (!currentPayment) {
        payMsg.textContent = 'Aucun paiement à confirmer';
        return;
      }

      payMsg.textContent = 'Traitement du paiement...';
      confirmBtn.disabled = true;
      cancelBtn.disabled = true;

      try {
        const from_wallet_id = Number(payerSelect.value);
        const to_wallet_id = currentPayment.to_wallet_id;
        const amount_cents = currentPayment.amount_cents;
        const original_currency = currentPayment.currency;
        const note = 'Paiement via QR';
        const qr_nonce = currentPayment.nonce;

        const res = await api('/api/pay', {
          method: 'POST',
          body: JSON.stringify({
            from_wallet_id, to_wallet_id, amount_cents, note, qr_nonce, original_currency
          }),
          headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) throw new Error('Erreur lors du paiement');

        payMsg.textContent = 'Paiement effectué avec succès !';
        updatePayerBalance();
        resetPaymentUI();

      } catch (err) {
        payMsg.textContent = 'Erreur paiement : ' + err.message;
      } finally {
        confirmBtn.disabled = false;
        cancelBtn.disabled = false;
      }
    });

    // Annuler le paiement / reset UI
    cancelBtn.addEventListener('click', () => {
      resetPaymentUI();
    });

    // Réinitialise l'interface de paiement
    function resetPaymentUI() {
      scanResult.textContent = '';
      payMsg.textContent = '';
      actionRow.classList.add('hidden');
      currentPayment = null;
    }
  }

  // ===========================
  // Gestion devise globale
  // ===========================
  function onCurrencyChange(e) {
    const newCurrency = e.target.value;
    updateCurrencyBadge(newCurrency);
    // Si besoin, mettre à jour d’autres UI ou valeurs (ex: montant à payer)
  }

  // Met à jour le badge de la devise affichée à côté du montant (ex: page merchant, pay)
  function updateCurrencyBadge(currency) {
    const badge = document.getElementById('amountCurrency');
    if (badge) {
      badge.textContent = currency;
    }
  }

  // ===========================
  // Fonction API commune
  // ===========================
  async function api(path, options = {}) {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    if (!res.ok) {
      const message = await res.text();
      throw new Error(message || 'Erreur serveur');
    }

    return res.json();
  }

  // ===========================
  // Formatage montant (copie depuis common.js pour s'assurer)
  // ===========================
  function formatAmount(cents, currency) {
    const symbol = {
      BAM: 'KM', BGN: 'лв', HRK: 'kn', CZK: 'Kč', DKK: 'kr', GBP: '£',
      HUF: 'Ft', MKD: 'ден', NOK: 'kr', PLN: 'zł', RON: 'lei', RSD: 'РСД',
      SEK: 'kr', CHF: 'CHF', TRY: '₺'
    }[currency] || currency;

    const amount = (cents / 100).toFixed(2);

    if (['kr', 'Kč', 'Ft', 'ден', 'zł', 'lei', 'РСД', '₺'].includes(symbol)) {
      return `${amount} ${symbol}`;
    } else {
      return `${symbol} ${amount}`;
    }
  }

})();
