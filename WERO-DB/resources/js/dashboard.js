// ===============================================
// DASHBOARD.JS - PAGE TABLEAU DE BORD
// ===============================================

(function() {
  'use strict';

  // État local pour la page
  const state = {
    wallets: [],
    transactions: []
  };

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

  async function refreshDashboard(elements) {
    try {
      // Charger les wallets
      const wallets = await api('/api/wallets');
      state.wallets = wallets;

      // Mettre à jour le tableau des wallets
      // Ici on suppose que chaque wallet a : name, type (client|merchant), balance_cents, currencyId
      // Pour la devise, on affiche simplement currencyId (id numérique)
      const walletRows = wallets.map(w => `
        <tr>
          <td>${w.name}</td>
          <td>${w.type}</td>
          <td><strong>${formatAmount(w.balance_cents)}</strong></td>
          <td>${w.currencyId}</td>
        </tr>
      `).join('');

      elements.walletTable.querySelector('tbody').innerHTML = walletRows;

      // Charger les transactions
      const txs = await api('/api/transactions');
      state.transactions = txs;

      // Pour les transactions, on utilise les propriétés du modèle Transaction :
      // id, amount, userId, merchantId, currencyId, status, description, createdAt
      // On va afficher id, date, userId, merchantId, amount formaté, currencyId, status

      const txRows = txs.length > 0
        ? txs.map(t => `
          <tr>
            <td>${t.id}</td>
            <td>${new Date(t.createdAt).toLocaleString('fr-FR')}</td>
            <td>${t.userId}</td>
            <td>${t.merchantId}</td>
            <td><strong>${formatAmount(t.amount)}</strong></td>
            <td>${t.currencyId}</td>
            <td>${t.status}</td>
          </tr>
        `).join('')
        : '<tr><td colspan="7" class="muted">Aucune transaction</td></tr>';

      elements.txTable.querySelector('tbody').innerHTML = txRows;

      console.log('Dashboard refreshed successfully');
    } catch (error) {
      console.error('Dashboard refresh failed:', error);
      showError('Erreur lors du rafraîchissement des données');
    }
  }

  // Fonction simple pour afficher un montant (ici on suppose que amount est déjà en unité principale, sinon adapter)
  function formatAmount(amountCents) {
    // Si amountCents est un entier en centimes, on divise par 100
    if (typeof amountCents === 'number') {
      return (amountCents / 100).toFixed(2);
    }
    return amountCents;
  }

  function showError(message) {
    alert(message);
  }

})();
