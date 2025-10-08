// ===============================================
// PAY.JS - PAGE PAIEMENT (SCAN ET PAIEMENT)
// ===============================================

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  let elements = {};

  function init() {
    console.log('Initializing Pay page');

    elements = {
      currencySelect: document.getElementById('currencySelect'),
      payerSelect: document.getElementById('payerSelect'),
      payerBalance: document.getElementById('payerBalance'),
      merchantSelect: document.getElementById('merchantSelect'),
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
      txTable: document.getElementById('txTable')
    };

    // Vérifier les éléments essentiels
    if (!elements.payerSelect || !elements.reader) {
      console.warn('Pay: missing essential elements');
      return;
    }

    setupEventListeners();
    refresh();
    setupMockScanner();
  }

  function setupEventListeners() {
    if (elements.payerSelect) {
      elements.payerSelect.addEventListener('change', updatePayerBalance);
    }

    if (elements.makeQRBtn) {
      elements.makeQRBtn.addEventListener('click', buildQR);
    }

    if (elements.confirmBtn) {
      elements.confirmBtn.addEventListener('click', confirmPay);
    }

    if (elements.cancelBtn) {
      elements.cancelBtn.addEventListener('click', cancelPay);
    }

    if (elements.refreshBtn) {
      elements.refreshBtn.addEventListener('click', refresh);
    }

    if (elements.currencySelect) {
      elements.currencySelect.addEventListener('change', updateSelectedCurrency);
    }
  }

  // ===============================================
  // RAFRAÎCHISSEMENT DES DONNÉES
  // ===============================================

  async function refresh() {
    try {
      const wallets = await mockApi('/api/wallets');
      state.wallets = wallets;

      const customers = wallets.filter(x => x.kind === 'customer');
      const merchants = wallets.filter(x => x.kind === 'merchant');

      // Remplir les sélecteurs
      if (elements.payerSelect) {
        elements.payerSelect.innerHTML = customers.map(c =>
          `<option value="${c.id}">${c.name} (${c.currency})</option>`
        ).join('');
      }

      if (elements.merchantSelect) {
        elements.merchantSelect.innerHTML = merchants.map(m =>
          `<option value="${m.id}">${m.name} (${m.currency})</option>`
        ).join('');
      }

      // Remplir le sélecteur de devises
      if (elements.currencySelect) {
        elements.currencySelect.innerHTML = Object.entries(CURRENCIES).map(([code, info]) =>
          `<option value="${code}" ${code === state.selectedCurrency ? 'selected' : ''}>${code} - ${info.name}</option>`
        ).join('');
      }

      updatePayerBalance();
      updateAmountCurrency();

      // Mettre à jour le tableau des wallets
      if (elements.walletTable) {
        elements.walletTable.querySelector('tbody').innerHTML = wallets.map(x =>
          `<tr>
            <td>${x.name}</td>
            <td>${x.kind}</td>
            <td><strong>${formatAmount(x.balance_cents, x.currency)}</strong></td>
            <td>${x.currency}</td>
          </tr>`
        ).join('');
      }

      // Charger les transactions
      const txs = await mockApi('/api/transactions');
      if (elements.txTable) {
        const txRows = txs.length > 0
          ? txs.map(t => {
              const displayAmount = t.original_currency
                ? formatAmount(t.amount_cents, t.original_currency)
                : formatAmount(t.from_amount_cents || t.amount_cents, t.from_currency || 'EUR');

              return `
                <tr>
                  <td>${t.id}</td>
                  <td>${new Date(t.ts).toLocaleString('fr-FR')}</td>
                  <td>${t.from_name || '—'}</td>
                  <td>${t.to_name}</td>
                  <td><strong>${displayAmount}</strong></td>
                  <td>${t.original_currency || t.from_currency || '—'}</td>
                </tr>
              `;
            }).join('')
          : '<tr><td colspan="6" class="muted">Aucune transaction</td></tr>';

        elements.txTable.querySelector('tbody').innerHTML = txRows;
      }

      console.log('Pay page refreshed successfully');
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  }

  function updatePayerBalance() {
    if (!elements.payerSelect || !elements.payerBalance) return;

    const id = Number(elements.payerSelect.value);
    const wallet = state.wallets.find(x => x.id === id);
    elements.payerBalance.textContent = wallet
      ? formatAmount(wallet.balance_cents, wallet.currency)
      : '—';
  }

  function updateAmountCurrency() {
    if (elements.amountCurrency) {
      elements.amountCurrency.textContent = state.selectedCurrency;
    }
  }

  function updateSelectedCurrency() {
    if (elements.currencySelect) {
      state.selectedCurrency = elements.currencySelect.value;
      updateAmountCurrency();
    }
  }

  // ===============================================
  // GÉNÉRATION DE QR CODE
  // ===============================================

  function buildQR() {
    if (!elements.merchantSelect || !elements.amountInput || !elements.qrcodeDiv) return;

    const merchId = Number(elements.merchantSelect.value);
    const amtValue = Number(elements.amountInput.value);
    const currency = state.selectedCurrency;

    if (!merchId || !amtValue || amtValue <= 0) {
      alert('Choisissez un commerçant et un montant valide');
      return;
    }

    const cents = Math.round(amtValue * 100);
    const payload = ['LZPAY', merchId, cents, currency, makeNonce()].join('|');

    elements.qrcodeDiv.innerHTML = '';

    if (state.qrCodeInstance) {
      state.qrCodeInstance.clear();
    }

    if (typeof QRCode === 'undefined') {
      elements.qrcodeDiv.innerHTML = '<div class="error">QRCode library not loaded</div>';
      return;
    }

    state.qrCodeInstance = new QRCode(elements.qrcodeDiv, {
      text: payload,
      width: 256,
      height: 256,
      correctLevel: QRCode.CorrectLevel.M
    });

    console.log('QR Code generated:', payload);
  }

  // ===============================================
  // SCANNER QR CODE (MODE DÉMO)
  // ===============================================

  function setupMockScanner() {
    if (!elements.reader) return;

    elements.reader.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div class="muted" style="margin-bottom: 15px;">Scanner QR - Mode Démo</div>
        <button id="simulateBtn" class="btn-primary">Simuler scan QR</button>
        <div class="muted" style="margin-top: 10px; font-size: 0.8em;">
          (Dans la vraie app, ceci serait la caméra)
        </div>
      </div>
    `;

    const simulateBtn = document.getElementById('simulateBtn');
    if (simulateBtn) {
      simulateBtn.addEventListener('click', () => {
        if (state.qrCodeInstance && elements.merchantSelect && elements.amountInput) {
          const merchId = Number(elements.merchantSelect.value);
          const amtValue = Number(elements.amountInput.value);
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
  }

  async function handleScanPayload(payload) {
    if (!elements.scanResult || !elements.actionRow) return;

    try {
      const response = await mockApi('/api/decode-qr', {
        method: 'POST',
        body: JSON.stringify({ payload })
      });

      const { to_wallet_id, amount_cents, currency, merchant_name, merchant_currency, nonce } = response;
      const payerId = Number(elements.payerSelect.value);

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

      const convertedAmount = convertCurrency(amount_cents, currency, payerCurrency);

      let conversionInfo = '';
      if (currency !== payerCurrency) {
        conversionInfo = `<br><small class="muted">Converti de ${formatAmount(amount_cents, currency)} vers ${formatAmount(convertedAmount, payerCurrency)}</small>`;
      }

      elements.scanResult.innerHTML = `
        <div style="padding: 10px; background: #065f46; border-radius: 8px; color: #10b981;">
          <strong>QR scanné avec succès!</strong><br>
          Payeur: <strong>${payerName}</strong> (${payerCurrency}) → Commerçant: <strong>${merchant_name}</strong> (${merchant_currency})<br>
          Montant: <strong>${formatAmount(convertedAmount, payerCurrency)}</strong>
          ${conversionInfo}
        </div>
      `;

      elements.actionRow.classList.remove('hidden');

    } catch (error) {
      elements.scanResult.innerHTML = `<div class="error">Erreur: ${error.message || error}</div>`;
    }
  }

  // ===============================================
  // GESTION DES PAIEMENTS
  // ===============================================

  async function confirmPay() {
    const p = state.currentScan;
    if (!p || !elements.confirmBtn || !elements.payMsg) return;

    elements.confirmBtn.disabled = true;
    elements.payMsg.textContent = 'Traitement en cours...';

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

      elements.payMsg.innerHTML = '<span class="success">✅ Paiement réussi</span>';

      await refresh();

      if (elements.actionRow) elements.actionRow.classList.add('hidden');
      if (elements.scanResult) elements.scanResult.textContent = '';
      state.currentScan = null;

      setTimeout(() => {
        elements.payMsg.textContent = '';
        elements.confirmBtn.disabled = false;
      }, 3000);

    } catch (error) {
      elements.payMsg.innerHTML = `<span class="error">❌ ${error.message || 'Erreur de paiement'}</span>`;
      elements.confirmBtn.disabled = false;
      console.error('Payment error:', error);
    }
  }

  function cancelPay() {
    state.currentScan = null;
    
    if (elements.actionRow) {
      elements.actionRow.classList.add('hidden');
    }
    
    if (elements.scanResult) {
      elements.scanResult.textContent = '';
    }
    
    if (elements.payMsg) {
      elements.payMsg.textContent = '';
    }
    
    if (elements.confirmBtn) {
      elements.confirmBtn.disabled = false;
    }
    
    console.log('Payment cancelled');
  }

})();