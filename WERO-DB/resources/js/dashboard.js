// ===============================================
// DASHBOARD.JS - PAGE TABLEAU DE BORD
// ===============================================

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    console.log('Initializing Dashboard page');

    const elements = {
      refreshBtn: document.getElementById('refreshBtn'),
      walletTable: document.getElementById('walletTable'),
      txTable: document.getElementById('txTable')
    };

    // Vérifier que les éléments essentiels existent
    if (!elements.refreshBtn || !elements.walletTable || !elements.txTable) {
      console.warn('Dashboard: missing essential elements');
      return;
    }

    setupEventListeners(elements);
    refreshDashboard(elements);
  }

  function setupEventListeners(elements) {
    elements.refreshBtn.addEventListener('click', () => refreshDashboard(elements));
  }

  async function refreshDashboard(elements) {
    try {
      // Charger les wallets
      const wallets = await mockApi('/api/wallets');
      state.wallets = wallets;

      // Mettre à jour le tableau des wallets
      const walletRows = wallets.map(w => `
        <tr>
          <td>${w.name}</td>
          <td>${w.kind}</td>
          <td><strong>${formatAmount(w.balance_cents, w.currency)}</strong></td>
          <td>${w.currency}</td>
        </tr>
      `).join('');

      elements.walletTable.querySelector('tbody').innerHTML = walletRows;

      // Charger les transactions
      const txs = await mockApi('/api/transactions');

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

      console.log('Dashboard refreshed successfully');
    } catch (error) {
      console.error('Dashboard refresh failed:', error);
      showError('Erreur lors du rafraîchissement des données');
    }
  }

  function showError(message) {
    alert(message);
  }

})();