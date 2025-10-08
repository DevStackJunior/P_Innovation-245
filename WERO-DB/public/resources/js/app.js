// ===============================================
// DONNÉES MOCK ET ÉTAT DE L'APPLICATION
// ===============================================

// Configuration des devises supportées
const CURRENCIES = {
  BAM: { name: 'Mark convertible de Bosnie', symbol: 'KM', rate: 1.96 }, // 1 EUR = 1.96 BAM
  BGN: { name: 'Lev bulgare', symbol: 'лв', rate: 1.96 },
  HRK: { name: 'Kuna croate', symbol: 'kn', rate: 7.53 },
  CZK: { name: 'Couronne tchèque', symbol: 'Kč', rate: 25.40 },
  DKK: { name: 'Couronne danoise', symbol: 'kr', rate: 7.46 },
  GBP: { name: 'Livre sterling', symbol: '£', rate: 0.86 },
  HUF: { name: 'Forint hongrois', symbol: 'Ft', rate: 390.50 },
  MKD: { name: 'Denar macédonien', symbol: 'ден', rate: 61.60 },
  NOK: { name: 'Couronne norvégienne', symbol: 'kr', rate: 11.85 },
  PLN: { name: 'Zloty polonais', symbol: 'zł', rate: 4.32 },
  RON: { name: 'Nouveau leu roumain', symbol: 'lei', rate: 4.98 },
  RSD: { name: 'Dinar serbe', symbol: 'РСД', rate: 117.25 },
  SEK: { name: 'Couronne suédoise', symbol: 'kr', rate: 11.60 },
  CHF: { name: 'Franc suisse', symbol: 'CHF', rate: 0.93 }, // Devise de référence proche de EUR
  TRY: { name: 'Livre turque', symbol: '₺', rate: 32.50 }
};

// EUR comme devise de référence interne (rate = 1)
const BASE_CURRENCY = 'EUR';
const BASE_RATE = 1.0;

// Mock data for POC demonstration - avec devises
const mockWallets = [
  { id: 1, name: 'Alice', kind: 'customer', balance_cents: 15000, currency: 'CHF' },
  { id: 2, name: 'Bruno', kind: 'customer', balance_cents: 8000, currency: 'EUR' },
  { id: 3, name: 'Camille', kind: 'customer', balance_cents: 2500, currency: 'GBP' },
  { id: 4, name: 'Café de la Gare', kind: 'merchant', balance_cents: 0, currency: 'CHF' },
  { id: 5, name: 'Boutique Léman', kind: 'merchant', balance_cents: 0, currency: 'EUR' },
  { id: 6, name: 'Musée Cantonal', kind: 'merchant', balance_cents: 0, currency: 'NOK' },
];

const mockTransactions = [];

const state = {
  wallets: [...mockWallets],
  transactions: [...mockTransactions],
  currentScan: null,
  scanner: null,
  qrCodeInstance: null,
  selectedCurrency: 'CHF' // Devise d'affichage par défaut
};

// ===============================================
// FONCTIONS UTILITAIRES MULTI-DEVISES
// ===============================================

// Conversion entre devises (tout passe par EUR comme référence)
function convertCurrency(amountCents, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return amountCents;
  
  // Convertir vers EUR d'abord
  let eurCents;
  if (fromCurrency === BASE_CURRENCY) {
    eurCents = amountCents;
  } else {
    const fromRate = CURRENCIES[fromCurrency]?.rate || 1;
    eurCents = Math.round(amountCents / fromRate);
  }
  
  // Puis vers la devise cible
  if (toCurrency === BASE_CURRENCY) {
    return eurCents;
  } else {
    const toRate = CURRENCIES[toCurrency]?.rate || 1;
    return Math.round(eurCents * toRate);
  }
}

// Formatage des montants avec devise
function formatAmount(cents, currency) {
  const symbol = CURRENCIES[currency]?.symbol || currency;
  const amount = (cents / 100).toFixed(2);
  
  // Pour certaines devises, le symbole va après
  if (['kr', 'Kč', 'Ft', 'ден', 'zł', 'lei', 'РСД', '₺'].includes(symbol)) {
    return `${amount} ${symbol}`;
  } else {
    return `${symbol} ${amount}`;
  }
}

// Fonction de compatibilité (remplace l'ancien CHF)
const CHF = (cents, currency = 'CHF') => formatAmount(cents, currency);

function makeNonce() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ===============================================
// RÉFÉRENCES DOM
// ===============================================

// Get DOM elements
const currencySelect = document.getElementById('currencySelect');
const payerSelect = document.getElementById('payerSelect');
const payerBalance = document.getElementById('payerBalance');
const merchantSelect = document.getElementById('merchantSelect');
const amountInput = document.getElementById('amountInput');
const amountCurrency = document.getElementById('amountCurrency');
const makeQRBtn = document.getElementById('makeQR');
const qrcodeDiv = document.getElementById('qrcode');
const scanResult = document.getElementById('scanResult');
const actionRow = document.getElementById('actionRow');
const confirmBtn = document.getElementById('confirmBtn');
const cancelBtn = document.getElementById('cancelBtn');
const payMsg = document.getElementById('payMsg');
const refreshBtn = document.getElementById('refreshBtn');
const walletTable = document.getElementById('walletTable');
const txTable = document.getElementById('txTable');
const reader = document.getElementById('reader');

// ===============================================
// API MOCK - SIMULATION DES APPELS SERVEUR
// ===============================================

async function mockApi(path, opts = {}) {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
 
  if (path === '/api/wallets') {
    return state.wallets;
  }
 
  if (path === '/api/transactions') {
    return state.transactions.slice(-10).reverse();
  }
  
  if (path === '/api/currencies') {
    return {
      currencies: CURRENCIES,
      baseCurrency: BASE_CURRENCY
    };
  }
 
  if (path === '/api/pay' && opts.method === 'POST') {
    const data = JSON.parse(opts.body);
    const { from_wallet_id, to_wallet_id, amount_cents, note, qr_nonce, original_currency } = data;
   
    const fromWallet = state.wallets.find(w => w.id === from_wallet_id);
    const toWallet = state.wallets.find(w => w.id === to_wallet_id);
   
    if (!fromWallet || !toWallet) {
      throw new Error('Wallet not found');
    }

    // Convertir le montant vers la devise du payeur pour vérification
    const amountInPayerCurrency = convertCurrency(amount_cents, original_currency, fromWallet.currency);
   
    if (fromWallet.balance_cents < amountInPayerCurrency) {
      throw new Error('Insufficient funds');
    }

    // Convertir vers la devise du receveur
    const amountInReceiverCurrency = convertCurrency(amount_cents, original_currency, toWallet.currency);
   
    // Update balances
    fromWallet.balance_cents -= amountInPayerCurrency;
    toWallet.balance_cents += amountInReceiverCurrency;
   
    // Add transaction
    const tx = {
      id: state.transactions.length + 1,
      ts: new Date().toISOString(),
      from_wallet_id,
      to_wallet_id,
      amount_cents,
      original_currency,
      from_currency: fromWallet.currency,
      to_currency: toWallet.currency,
      from_amount_cents: amountInPayerCurrency,
      to_amount_cents: amountInReceiverCurrency,
      note,
      qr_nonce,
      from_name: fromWallet.name,
      to_name: toWallet.name
    };
   
    state.transactions.push(tx);
   
    return { ok: true, tx };
  }
 
  if (path === '/api/decode-qr' && opts.method === 'POST') {
    const data = JSON.parse(opts.body);
    const payload = data.payload;
    const parts = payload.split('|');
   
    if (parts[0] !== 'LZPAY' || parts.length < 5) {
      throw new Error('Invalid QR code format');
    }
   
    const [, merchantId, amountCentsStr, currency, nonce] = parts;
    const to_wallet_id = Number(merchantId);
    const amount_cents = Number(amountCentsStr);
   
    const merchant = state.wallets.find(w => w.id === to_wallet_id && w.kind === 'merchant');
   
    if (!merchant) {
      throw new Error('Unknown merchant');
    }

    if (!CURRENCIES[currency] && currency !== BASE_CURRENCY) {
      throw new Error('Unsupported currency');
    }
   
    return {
      ok: true,
      to_wallet_id,
      amount_cents,
      currency,
      merchant_name: merchant.name,
      merchant_currency: merchant.currency,
      nonce
    };
  }
 
  throw new Error('Unknown API endpoint');
}

// ===============================================
// GESTION DE L'INTERFACE - RAFRAÎCHISSEMENT
// ===============================================

async function refresh() {
  try {
    const wallets = await mockApi('/api/wallets');
    state.wallets = wallets;
   
    const customers = wallets.filter(x => x.kind === 'customer');
    const merchants = wallets.filter(x => x.kind === 'merchant');
   
    payerSelect.innerHTML = customers.map(c =>
      `<option value="${c.id}">${c.name} (${c.currency})</option>`
    ).join('');
   
    merchantSelect.innerHTML = merchants.map(m =>
      `<option value="${m.id}">${m.name} (${m.currency})</option>`
    ).join('');

    // Populer le sélecteur de devises
    if (currencySelect) {
      currencySelect.innerHTML = Object.entries(CURRENCIES).map(([code, info]) =>
        `<option value="${code}" ${code === state.selectedCurrency ? 'selected' : ''}>${code} - ${info.name}</option>`
      ).join('');
    }
   
    updatePayerBalance();
    updateAmountCurrency();
   
    walletTable.querySelector('tbody').innerHTML = wallets.map(x =>
      `<tr><td>${x.name}</td><td>${x.kind}</td><td><strong>${formatAmount(x.balance_cents, x.currency)}</strong></td><td>${x.currency}</td></tr>`
    ).join('');
   
    const txs = await mockApi('/api/transactions');
    const txRows = txs.length > 0
      ? txs.map(t => {
          const displayAmount = t.original_currency ? 
            formatAmount(t.amount_cents, t.original_currency) : 
            formatAmount(t.from_amount_cents || t.amount_cents, t.from_currency || 'EUR');
          
          return `<tr>
            <td>${t.id}</td>
            <td>${new Date(t.ts).toLocaleString()}</td>
            <td>${t.from_name || '—'}</td>
            <td>${t.to_name}</td>
            <td><strong>${displayAmount}</strong></td>
            <td>${t.original_currency || t.from_currency || '—'}</td>
          </tr>`;
        }).join('')
      : '<tr><td colspan="6" class="muted">Aucune transaction</td></tr>';
     
    txTable.querySelector('tbody').innerHTML = txRows;
  } catch (e) {
    console.error('Refresh failed:', e);
  }
}

function updatePayerBalance() {
  const id = Number(payerSelect.value);
  const wallet = state.wallets.find(x => x.id === id);
  payerBalance.textContent = wallet ? formatAmount(wallet.balance_cents, wallet.currency) : '—';
}

function updateAmountCurrency() {
  if (amountCurrency) {
    amountCurrency.textContent = state.selectedCurrency;
  }
}

function updateSelectedCurrency() {
  if (currencySelect) {
    state.selectedCurrency = currencySelect.value;
    updateAmountCurrency();
  }
}

// ===============================================
// GÉNÉRATION DE QR CODE
// ===============================================

function buildQR() {
  const merchId = Number(merchantSelect.value);
  const amtValue = Number(amountInput.value);
  const currency = state.selectedCurrency;
 
  if (!merchId || !amtValue || amtValue <= 0) {
    alert('Choisissez un commerçant et un montant');
    return;
  }
 
  const cents = Math.round(amtValue * 100);
  const payload = ['LZPAY', merchId, cents, currency, makeNonce()].join('|');
 
  qrcodeDiv.innerHTML = '';
 
  if (state.qrCodeInstance) {
    state.qrCodeInstance.clear();
  }
 
  state.qrCodeInstance = new QRCode(qrcodeDiv, {
    text: payload,
    width: 256,
    height: 256,
    correctLevel: QRCode.CorrectLevel.M
  });
}

// ===============================================
// SCANNER QR CODE (MODE DÉMO)
// ===============================================

function setupMockScanner() {
  reader.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <div class="muted" style="margin-bottom: 15px;">Scanner QR - Mode Démo</div>
      <button id="simulateBtn" class="btn-primary">Simuler scan QR</button>
      <div class="muted" style="margin-top: 10px; font-size: 0.8em;">
        (Dans la vraie app, ceci serait la caméra)
      </div>
    </div>
  `;
 
  document.getElementById('simulateBtn').addEventListener('click', () => {
    // Simulate scanning the currently generated QR
    if (state.qrCodeInstance) {
      const merchId = Number(merchantSelect.value);
      const amtValue = Number(amountInput.value);
      const currency = state.selectedCurrency;
      if (merchId && amtValue > 0) {
        const cents = Math.round(amtValue * 100);
        const payload = ['LZPAY', merchId, cents, currency, makeNonce()].join('|');
        handleScanPayload(payload);
      } else {
        alert('Générez d\'abord un QR code !');
      }
    } else {
      alert('Générez d\'abord un QR code !');
    }
  });
}

async function handleScanPayload(payload) {
  try {
    const response = await mockApi('/api/decode-qr', {
      method: 'POST',
      body: JSON.stringify({ payload })
    });
   
    const { to_wallet_id, amount_cents, currency, merchant_name, merchant_currency, nonce } = response;
    const payerId = Number(payerSelect.value);
   
    state.currentScan = {
      to_wallet_id,
      amount_cents,
      currency,
      merchant_name,
      merchant_currency,
      nonce,
      from_wallet_id: payerId
    };
   
    const payerWallet = state.wallets.find(x => x.id === payerId);
    const payerName = payerWallet?.name;
    const payerCurrency = payerWallet?.currency;

    // Calculer le montant converti pour le payeur
    const convertedAmount = convertCurrency(amount_cents, currency, payerCurrency);

    let conversionInfo = '';
    if (currency !== payerCurrency) {
      conversionInfo = `<br><small class="muted">Converti de ${formatAmount(amount_cents, currency)} vers ${formatAmount(convertedAmount, payerCurrency)}</small>`;
    }
   
    scanResult.innerHTML = `
      <div style="padding: 10px; background: #065f46; border-radius: 8px; color: #10b981;">
        <strong>QR scanné avec succès!</strong><br>
        Payeur: <strong>${payerName}</strong> (${payerCurrency}) → Commerçant: <strong>${merchant_name}</strong> (${merchant_currency})<br>
        Montant: <strong>${formatAmount(convertedAmount, payerCurrency)}</strong>
        ${conversionInfo}
      </div>
    `;
   
    actionRow.classList.remove('hidden');
   
  } catch (e) {
    scanResult.innerHTML = `<div class="error">Erreur: ${e.message || e}</div>`;
  }
}

// ===============================================
// GESTION DES PAIEMENTS
// ===============================================

async function confirmPay() {
  const p = state.currentScan;
  if (!p) return;
 
  confirmBtn.disabled = true;
  payMsg.textContent = 'Traitement en cours...';
 
  try {
    await mockApi('/api/pay', {
      method: 'POST',
      body: JSON.stringify({
        from_wallet_id: p.from_wallet_id,
        to_wallet_id: p.to_wallet_id,
        amount_cents: p.amount_cents,
        original_currency: p.currency,
        note: 'QR payment',
        qr_nonce: p.nonce
      })
    });
   
    payMsg.innerHTML = '<span class="success">✅ Paiement réussi</span>';
   
    await refresh();
    actionRow.classList.add('hidden');
    scanResult.textContent = '';
    state.currentScan = null;
   
    // Clear the QR code
    if (state.qrCodeInstance) {
      qrcodeDiv.innerHTML = '<div class="muted">Le QR code apparaîtra ici</div>';
      state.qrCodeInstance = null;
    }
    amountInput.value = '';
   
  } catch (e) {
    payMsg.innerHTML = `<span class="error">❌ ${e.message || e}</span>`;
  } finally {
    confirmBtn.disabled = false;
  }
}

function cancelPay() {
  state.currentScan = null;
  actionRow.classList.add('hidden');
  scanResult.textContent = '';
  payMsg.textContent = '';
}

// ===============================================
// GESTION DES ÉVÉNEMENTS
// ===============================================

payerSelect.addEventListener('change', updatePayerBalance);
makeQRBtn.addEventListener('click', buildQR);
confirmBtn.addEventListener('click', confirmPay);
cancelBtn.addEventListener('click', cancelPay);
refreshBtn.addEventListener('click', refresh);

// Nouveaux event listeners pour les devises
if (currencySelect) {
  currencySelect.addEventListener('change', updateSelectedCurrency);
}

// ===============================================
// INITIALISATION DE L'APPLICATION
// ===============================================

(async () => {
  await refresh();
  setupMockScanner();
})();
