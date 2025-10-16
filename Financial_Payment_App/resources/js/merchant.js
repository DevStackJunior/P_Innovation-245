// ===============================================
// MERCHANT.JS - PAGE COMMERÇANT (GÉNÉRATION QR)
// ===============================================

import QRCode from 'qrcode'
;(function () {
  'use strict'

  document.addEventListener('DOMContentLoaded', init)

  function init() {
    console.log('Initializing Merchant page')

    const elements = {
      currencySelect: document.getElementById('currencySelect'),
      merchantSelect: document.getElementById('merchantSelect'),
      amountInput: document.getElementById('amountInput'),
      amountCurrency: document.getElementById('amountCurrency'),
      makeQRBtn: document.getElementById('makeQR'),
      qrcodeDiv: document.getElementById('qrcode'),
      descriptionInput: document.getElementById('description'),
    }

    // Vérifier que les éléments essentiels existent
    if (!elements.makeQRBtn || !elements.qrcodeDiv) {
      console.warn('Merchant: missing essential elements')
      return
    }

    loadMerchants(elements)
    setupEventListeners(elements)
  }

  function setupEventListeners(elements) {
    // Générer le QR code
    elements.makeQRBtn.addEventListener('click', () => buildQR(elements))

    // Permettre Enter dans le champ montant
    if (elements.amountInput) {
      elements.amountInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          buildQR(elements)
        }
      })
    }
  }

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

  async function loadMerchants(elements) {
    if (!elements.merchantSelect) return

    try {
      const wallets = await api('/api/wallets')

      // Changement ici : filtrer sur type, pas kind
      const merchants = wallets.filter((w) => w.type === 'merchant')

      // Pour la devise, tu peux afficher simplement currencyId, ou si tu as un mapping CURRENCIES  (Devise ID: ${m.currencyId})
      elements.merchantSelect.innerHTML = merchants
        .map((m) => `<option value="1">${m.name}</option>`)
        .join('')

      console.log('Merchants loaded:', merchants.length)
    } catch (error) {
      console.error('Failed to load merchants:', error)
      showError('Erreur lors du chargement des commerçants')
    }
  }

  async function buildQR(elements) {
    const merchId = Number(elements.merchantSelect?.value)
    const amtValue = Number(elements.amountInput?.value)
    const currency = elements.currencySelect?.value
    const description = elements.descriptionInput?.value

    // Validation
    if (!merchId) {
      showError('Veuillez sélectionner un commerçant')
      return
    }

    if (!amtValue || amtValue <= 0) {
      showError('Veuillez entrer un montant valide')
      return
    }

    // Convertir en centimes
    const cents = Math.round(amtValue * 100)

    // Créer le payload currency, makeNonce()
    const payload = ['LZPAY', merchId, cents, currency].join('|')

    // Nettoyer le conteneur
    elements.qrcodeDiv.innerHTML = ''

    try {
      QRCode.toDataURL(payload, async function (err, url) {
        try {
          await fetch(`/api/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: cents,
              userId: 1,
              merchantId: merchId,
              currencyId: currency,
              status: 'pending',
              description,
              qrCode: url,
              format: payload,
            }),
          })
          console.log('transaction crée')
        } catch (error) {
          console.log(err)
        }
      })
      const canvas = document.createElement('canvas')
      await QRCode.toCanvas(canvas, payload, { width: 256 })
      elements.qrcodeDiv.appendChild(canvas)

      const info = document.createElement('div')
      info.className = 'qr-info'
      info.innerHTML = `
      <p><strong>Commerçant:</strong> ${merchId}</p>
      <p><strong>Montant:</strong> ${amtValue} ${currency}</p>
      <p><small>${payload}</small></p>
    `
      elements.qrcodeDiv.appendChild(info)

      console.log('QR Code generated:', payload)
    } catch (err) {
      console.error('Erreur QR:', err)
      showError('Erreur lors de la génération du QR code')
    }

    // // Vérifier que QRCode est disponible
    // if (typeof QRCode === 'undefined') {
    //   showError('Bibliothèque QRCode non chargée')
    //   elements.qrcodeDiv.innerHTML = '<div class="error">QRCode library not loaded</div>'
    //   return
    // }

    // try {
    //   // Nettoyer l'ancienne instance si elle existe
    //   // if (state.qrCodeInstance) {
    //   //   state.qrCodeInstance.clear()
    //   // }

    //   // Générer le nouveau QR code
    //   new QRCode(elements.qrcodeDiv, {
    //     text: payload,
    //     width: 256,
    //     height: 256,
    //     // correctLevel: QRCode.CorrectLevel.M,
    //   })

    //   console.log('QR Code generated:', payload)

    //   // Afficher les informations du QR
    //   const merchant = state.wallets.find((w) => w.id === merchId)
    //   const info = document.createElement('div')
    //   info.className = 'qr-info'
    //   info.style.marginTop = '10px'
    //   info.style.fontSize = '0.9em'
    //   info.innerHTML = `
    //     <p><strong>Commerçant:</strong> ${merchant?.name}</p>
    //     <p><strong>Montant:</strong> ${formatAmount(cents, currency)}</p>
    //     <p class="muted" style="font-size: 0.8em; word-break: break-all;">
    //       <small>Données: ${payload}</small>
    //     </p>
    //   `
    //   elements.qrcodeDiv.appendChild(info)
    // } catch (error) {
    //   console.error('Error generating QR:', error)
    //   showError('Erreur lors de la génération du QR code')
    //   elements.qrcodeDiv.innerHTML = '<div class="error">Erreur génération QR</div>'
    // }
  }

  function showError(message) {
    alert(message)
    console.error('Merchant error:', message)
  }
})()
