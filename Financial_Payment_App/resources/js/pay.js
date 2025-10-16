(async function () {
  'use strict';

  // --- Variables globales ---
  let elements = {};
  const state = {
    wallets: [],        // Wallets chargés du backend (clients et marchands)
    currencies: [],     // Liste des devises { id, code, name, symbol }
    merchants: [],      // Liste marchands
    selectedCurrencyId: null,
    currentScan: null   // Données du paiement scanné (QR)
  };

  // --- Utils ---

  function formatAmount(cents, currency) {
    if (!currency) return `${(cents / 100).toFixed(2)}`;
    // currency = { code, symbol }
    return `${currency.symbol} ${(cents / 100).toFixed(2)}`;
  }

  function findCurrencyById(id) {
    return state.currencies.find(c => c.id === id);
  }

  // --- API call simplifiée ---

  async function api(path, options = {}) {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Erreur réseau');
    }
    return res.json();
  }

  // --- Chargement initial ---

  async function refresh() {
    try {
      // 1. Charger devises
      state.currencies = await api('/api/currencies');

      // 2. Charger wallets
      const walletsRaw = await api('/api/wallets');
      // Ajouter devise complète dans chaque wallet
      state.wallets = walletsRaw.map(w => {
        return {
          ...w,
          currency: findCurrencyById(w.currencyId)
        };
      });

      // 3. Charger marchands (si nécessaire pour dropdown)
      state.merchants = await api('/api/merchants');

      // 4. Charger transactions (dernières 10 par ex)
      const txs = await api('/api/transactions');

      // --- MAJ UI ---
      updateCurrencySelect();
      updateWalletsUI();
      updateTransactionsUI(txs);
      updatePayerSelect();
      updateMerchantSelect();

      console.log('Données rafraîchies');
    } catch (e) {
      console.error('Erreur lors du rafraîchissement :', e);
    }
  }

  // --- UI Updates ---

  function updateCurrencySelect() {
    if (!elements.currencySelect) return;
    elements.currencySelect.innerHTML = state.currencies.map(c =>
      `<option value="${c.id}">${c.code} - ${c.name}</option>`
    ).join('');
    if (state.currencies.length > 0) {
      state.selectedCurrencyId = state.currencies[0].id;
      elements.currencySelect.value = state.selectedCurrencyId;
    }
  }

  function updateWalletsUI() {
    if (!elements.walletTable) return;
    elements.walletTable.querySelector('tbody').innerHTML = state.wallets.map(w => {
      const bal = formatAmount(w.balance_cents, w.currency);
      return `
        <tr>
          <td>${w.name}</td>
          <td>${w.type}</td>
          <td>${bal}</td>
          <td>${w.currency?.code || ''}</td>
        </tr>
      `;
    }).join('');
  }

  function updateTransactionsUI(txs) {
    if (!elements.txTable) return;

    if (!Array.isArray(txs) || txs.length === 0) {
      elements.txTable.querySelector('tbody').innerHTML = `<tr><td colspan="6">Aucune transaction</td></tr>`;
      return;
    }

    elements.txTable.querySelector('tbody').innerHTML = txs.map(tx => {
      // Retrouver devise
      const cur = findCurrencyById(tx.currencyId);
      const date = new Date(tx.createdAt).toLocaleString('fr-FR');

      return `
        <tr>
          <td>${tx.id}</td>
          <td>${date}</td>
          <td>${tx.userId || '—'}</td>
          <td>${tx.merchantId || '—'}</td>
          <td>${formatAmount(tx.amount, cur)}</td>
          <td>${cur?.code || '—'}</td>
        </tr>
      `;
    }).join('');
  }

  function updatePayerSelect() {
    if (!elements.payerSelect) return;
    const clients = state.wallets.filter(w => w.type === 'client');
    elements.payerSelect.innerHTML = clients.map(c => `<option value="${c.id}">${c.name} (${c.currency?.code || ''})</option>`).join('');
    updatePayerBalance();
  }

  function updateMerchantSelect() {
    if (!elements.merchantSelect) return;
    // Soit la liste de marchands via API, soit wallets de type 'merchant'
    const merchants = state.wallets.filter(w => w.type === 'merchant');
    elements.merchantSelect.innerHTML = merchants.map(m => `<option value="${m.id}">${m.name} (${m.currency?.code || ''})</option>`).join('');
  }

  // --- Update balance affichée du payeur sélectionné ---

  function updatePayerBalance() {
    if (!elements.payerSelect || !elements.payerBalance) return;
    const payerId = Number(elements.payerSelect.value);
    const wallet = state.wallets.find(w => w.id === payerId);
    elements.payerBalance.textContent = wallet
      ? formatAmount(wallet.balance_cents, wallet.currency)
      : '—';
  }

  // --- Gestion paiement ---

  async function handleScanPayload(payload) {
    try {
      const response = await api('/api/decode-qr', {
        method: 'POST',
        body: JSON.stringify({ payload }),
      });

      // Exemple de retour: { to_wallet_id, amount_cents, currencyId, merchant_name, nonce }
      const { to_wallet_id, amount_cents, currencyId, merchant_name, nonce } = response;

      const from_wallet_id = Number(elements.payerSelect.value);
      const fromWallet = state.wallets.find(w => w.id === from_wallet_id);
      const toWallet = state.wallets.find(w => w.id === to_wallet_id);
      const fromCurrency = fromWallet?.currency;
      const toCurrency = toWallet?.currency || findCurrencyById(currencyId);

      // TODO: convertir montant si devises différentes (si tu as la fonction)
      // Pour l'instant on affiche le montant brut
      state.currentScan = {
        from_wallet_id,
        to_wallet_id,
        amount_cents,
        currencyId,
        nonce,
        merchant_name,
      };

      elements.scanResult.innerHTML = `
        <div style="padding: 10px; background-color: #065f46; color: #10b981; border-radius: 8px;">
          <strong>QR Code scanné avec succès !</strong><br>
          De : ${fromWallet?.name} (${fromCurrency?.code})<br>
          Vers : ${merchant_name} (${toCurrency?.code})<br>
          Montant : ${formatAmount(amount_cents, toCurrency)}
        </div>
      `;

      elements.actionRow.classList.remove('hidden');
    } catch (err) {
      elements.scanResult.innerHTML = `<div class="error">Erreur lors du scan : ${err.message}</div>`;
    }
  }

  async function confirmPay() {
    if (!state.currentScan) return;

    elements.confirmBtn.disabled = true;
    elements.payMsg.textContent = 'Traitement en cours...';

    try {
      await api('/api/pay', {
        method: 'POST',
        body: JSON.stringify({
          from_wallet_id: state.currentScan.from_wallet_id,
          to_wallet_id: state.currentScan.to_wallet_id,
          amount_cents: state.currentScan.amount_cents,
          currencyId: state.currentScan.currencyId,
          qr_nonce: state.currentScan.nonce,
        }),
      });

      elements.payMsg.innerHTML = '<span class="success">✅ Paiement réussi</span>';
      await refresh();
      cancelPay();
    } catch (err) {
      elements.payMsg.innerHTML = `<span class="error">❌ ${err.message}</span>`;
      elements.confirmBtn.disabled = false;
    }
  }

  function cancelPay() {
    state.currentScan = null;
    elements.scanResult.textContent = '';
    elements.actionRow.classList.add('hidden');
    elements.payMsg.textContent = '';
    if (elements.confirmBtn) elements.confirmBtn.disabled = false;
  }

  // --- Event Listeners ---

  function setupEventListeners() {
    if (elements.payerSelect) elements.payerSelect.addEventListener('change', updatePayerBalance);
    if (elements.currencySelect) elements.currencySelect.addEventListener('change', (e) => {
      state.selectedCurrencyId = Number(e.target.value);
    });
    if (elements.confirmBtn) elements.confirmBtn.addEventListener('click', confirmPay);
    if (elements.cancelBtn) elements.cancelBtn.addEventListener('click', cancelPay);
    if (elements.refreshBtn) elements.refreshBtn.addEventListener('click', refresh);
  }

  // --- Initialisation ---

  function init() {
    elements = {
      payerSelect: document.getElementById('payerSelect'),
      payerBalance: document.getElementById('payerBalance'),
      merchantSelect: document.getElementById('merchantSelect'),
      currencySelect: document.getElementById('currencySelect'),
      amountInput: document.getElementById('amountInput'),
      amountCurrency: document.getElementById('amountCurrency'),
      makeQRBtn: document.getElementById('makeQR'),
      qrcodeDiv: document.getElementById('qrcode'),
      reader: document.getElementById('reader'),
      scanResult: document.getElementById('scanResult'),
      actionRow: document.getElementById('actionRow'),
      confirmBtn: document.getElementById('confirmBtn'),
      cancelBtn: document.getElementById('cancelBtn'),
      payMsg: document.getElementById('payMsg'),
      refreshBtn: document.getElementById('refreshBtn'),
      walletTable: document.getElementById('walletTable'),
      txTable: document.getElementById('txTable'),
    };

    setupEventListeners();
    refresh();
  }

  // --- Lancement ---
  document.addEventListener('DOMContentLoaded', init);

})();
