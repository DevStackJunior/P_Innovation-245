// const clientSelect = document.getElementById('clientSelect')
// const merchantSelect = document.getElementById('merchantSelect')
// const currenciesSelect = document.getElementById('currenciesSelect')
// const merchantQr = document.getElementById('merchantQr')
// const scannedCodeSpan = document.getElementById('scannedCode')
// const amountInput = document.getElementById('amountInput')
// const payBtn = document.getElementById('payBtn')
const walletsTableBody = document.querySelector('#walletsTable tbody')
const transactionsTableBody = document.querySelector('#transactionsTable tbody')

// Charger wallets pour remplir sélecteurs et tableau
async function loadWallets() {
  const res = await fetch(`/api/wallets/${3}`)
  const wallets = await res.json()

  walletsTableBody.innerHTML = ''

  wallets.forEach((w) => {
    // Ajouter ligne tableau soldes
    const tr = document.createElement('tr')
    tr.innerHTML = `
        <td>${w.name}</td>
        <td>${w.type}</td>
        <td>${(w.balanceCents / 100).toFixed(2)}</td>
      `
    walletsTableBody.appendChild(tr)
  })
}

// Charger transactions récentes
async function loadTransactions() {
  const res = await fetch(`/api/transactions/${1}`)
  const transactions = await res.json()

  transactionsTableBody.innerHTML = ''

  transactions.forEach((t) => {
    transactionsTableBody.innerHTML += `
        <tr>
          <td>${t.user.pseudo || t.fromWalletId}</td>
          <td>${t.merchant.name || t.toWalletId}</td>
          <td>${(t.amount / 100).toFixed(2)}</td>
          <td>${t.description || ''}</td>
          <td>${new Date(t.createdAt).toLocaleString()}</td>
        </tr>
      `
  })
}

// Générer QR code du commerçant sélectionné
// function generateMerchantQr() {
//   const merchantId = merchantSelect.value
//   if (!merchantId) {
//     merchantQr.getContext('2d').clearRect(0, 0, merchantQr.width, merchantQr.height)
//     scannedMerchantId = null
//     payBtn.disabled = true
//     return
//   }
//   scannedMerchantId = merchantId
//   QRCode.toCanvas(merchantQr, merchantId, function (error) {
//     if (error) console.error(error)
//   })
//   updatePayBtnState()
// }

// Initialiser scanner QR code
// const html5QrCode = new Html5Qrcode('qr-reader')
// function onScanSuccess(decodedText, decodedResult) {
//   scannedCodeSpan.textContent = decodedText
//   updatePayBtnState()
// }
// function onScanError(errorMessage) {
//   // console.log(`Scan error: ${errorMessage}`)
// }

// Start scanner au chargement
// Html5Qrcode.getCameras()
//   .then((cameras) => {
//     if (cameras && cameras.length) {
//       const cameraId = cameras[0].id
//       html5QrCode.start(cameraId, { fps: 10, qrbox: 250 }, onScanSuccess, onScanError)
//     }
//   })
//   .catch((err) => {
//     console.error(err)
//     scannedCodeSpan.textContent = 'Erreur accès caméra'
//   })

// // Bouton paiement activé si tout est ok
// function updatePayBtnState() {
//   payBtn.disabled = !(
//     clientSelect.value &&
//     scannedCodeSpan.textContent &&
//     scannedCodeSpan.textContent !== 'Aucun' &&
//     amountInput.value > 0
//   )
// }

// clientSelect.addEventListener('change', updatePayBtnState)
// amountInput.addEventListener('input', updatePayBtnState)
// merchantSelect.addEventListener('change', generateMerchantQr)

// Bouton paiement click
// payBtn.addEventListener('click', async () => {
//   const fromWalletId = clientSelect.value
//   const toWalletId = scannedCodeSpan.textContent
//   const amount_cents = Number(amountInput.value)

//   if (!fromWalletId || !toWalletId || amount_cents <= 0) {
//     alert('Vérifie tous les champs !')
//     return
//   }

//   try {
//     const res = await fetch('/api/pay', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ fromWalletId, toWalletId, amount_cents }),
//     })

//     const data = await res.json()
//     if (!res.ok) throw new Error(data.message || 'Erreur paiement')

//     alert('Paiement réussi 🎉')
//     // Reload data
//     await loadWallets()
//     await loadTransactions()

//     amountInput.value = ''
//     scannedCodeSpan.textContent = 'Aucun'
//     payBtn.disabled = true
//   } catch (err) {
//     alert('Erreur: ' + err.message)
//   }
// })

// Load initial data
loadWallets()
loadTransactions()
// loadCurrencies()
