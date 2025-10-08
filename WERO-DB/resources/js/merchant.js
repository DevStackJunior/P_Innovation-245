// ===============================================
// MERCHANT.JS - PAGE COMMERÇANT (GÉNÉRATION QR)
// ===============================================

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    console.log('Initializing Merchant page');

    const elements = {
      currencySelect: document.getElementById('currencySelect'),
      merchantSelect: document.getElementById('merchantSelect'),
      amountInput: document.getElementById('amountInput'),
      amountCurrency: document.getElementById('amountCurrency'),
      makeQRBtn: document.getElementById('makeQR'),
      qrcodeDiv: document.getElementById('qrcode')
    };

    // Vérifier que les éléments essentiels existent
    if (!elements.makeQRBtn || !elements.qrcodeDiv) {
      console.warn('Merchant: missing essential elements');
      return;
    }

    loadMerchants(elements);
    populateCurrencySelect(elements);
    setupEventListeners(elements);
  }

  function setupEventListeners(elements) {
    // Générer le QR code
    elements.makeQRBtn.addEventListener('click', () => buildQR(elements));

    // Mettre à jour le badge de devise
    if (elements.currencySelect && elements.amountCurrency) {
      elements.currencySelect.addEventListener('change', () => {
        state.selectedCurrency = elements.currencySelect.value;
        elements.amountCurrency.textContent = elements.currencySelect.value;
      });
    }

    // Permettre Enter dans le champ montant
    if (elements.amountInput) {
      elements.amountInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          buildQR(elements);
        }
      });
    }
  }

  function populateCurrencySelect(elements) {
    if (!elements.currencySelect) return;

    elements.currencySelect.innerHTML = Object.entries(CURRENCIES).map(([code, info]) =>
      `<option value="${code}" ${code === state.selectedCurrency ? 'selected' : ''}>
        ${code} - ${info.name}
      </option>`
    ).join('');
  }

  async function loadMerchants(elements) {
    if (!elements.merchantSelect) return;

    try {
      const wallets = await mockApi('/api/wallets');
      state.wallets = wallets;

      const merchants = wallets.filter(w => w.kind === 'merchant');

      elements.merchantSelect.innerHTML = merchants.map(m =>
        `<option value="${m.id}">${m.name} (${m.currency})</option>`
      ).join('');

      console.log('Merchants loaded:', merchants.length);
    } catch (error) {
      console.error('Failed to load merchants:', error);
      showError('Erreur lors du chargement des commerçants');
    }
  }

  function buildQR(elements) {
    const merchId = Number(elements.merchantSelect?.value);
    const amtValue = Number(elements.amountInput?.value);
    const currency = state.selectedCurrency;

    // Validation
    if (!merchId) {
      showError('Veuillez sélectionner un commerçant');
      return;
    }

    if (!amtValue || amtValue <= 0) {
      showError('Veuillez entrer un montant valide');
      return;
    }

    // Convertir en centimes
    const cents = Math.round(amtValue * 100);

    // Créer le payload
    const payload = ['LZPAY', merchId, cents, currency, makeNonce()].join('|');

    // Nettoyer le conteneur
    elements.qrcodeDiv.innerHTML = '';

    // Vérifier que QRCode est disponible
    if (typeof QRCode === 'undefined') {
      showError('Bibliothèque QRCode non chargée');
      elements.qrcodeDiv.innerHTML = '<div class="error">QRCode library not loaded</div>';
      return;
    }

    try {
      // Nettoyer l'ancienne instance si elle existe
      if (state.qrCodeInstance) {
        state.qrCodeInstance.clear();
      }

      // Générer le nouveau QR code
      state.qrCodeInstance = new QRCode(elements.qrcodeDiv, {
        text: payload,
        width: 256,
        height: 256,
        correctLevel: QRCode.CorrectLevel.M
      });

      console.log('QR Code generated:', payload);

      // Afficher les informations du QR
      const merchant = state.wallets.find(w => w.id === merchId);
      const info = document.createElement('div');
      info.className = 'qr-info';
      info.style.marginTop = '10px';
      info.style.fontSize = '0.9em';
      info.innerHTML = `
        <p><strong>Commerçant:</strong> ${merchant?.name}</p>
        <p><strong>Montant:</strong> ${formatAmount(cents, currency)}</p>
        <p class="muted" style="font-size: 0.8em; word-break: break-all;">
          <small>Données: ${payload}</small>
        </p>
      `;
      elements.qrcodeDiv.appendChild(info);

    } catch (error) {
      console.error('Error generating QR:', error);
      showError('Erreur lors de la génération du QR code');
      elements.qrcodeDiv.innerHTML = '<div class="error">Erreur génération QR</div>';
    }
  }

  function showError(message) {
    alert(message);
    console.error('Merchant error:', message);
  }

})();