import { useState, useCallback } from 'react'
import BarcodeScanner from './BarcodeScanner.jsx'
import { BRANCHES, CATALOG, lookupBySku, monthsUntil } from './catalog.js'

export default function App() {
  const [branch, setBranch] = useState(BRANCHES[0].code)
  const [items, setItems] = useState([])
  const [showScanner, setShowScanner] = useState(false)
  const [toast, setToast] = useState(null)
  const [manualSku, setManualSku] = useState('')
  const [manualLot, setManualLot] = useState('')
  const [manualExpiry, setManualExpiry] = useState('')
  const [manualQty, setManualQty] = useState(1)
  const [unknownSku, setUnknownSku] = useState(null)

  const showToast = useCallback((msg) => {
    setToast(msg)
    window.clearTimeout(showToast._t)
    showToast._t = window.setTimeout(() => setToast(null), 2200)
  }, [])

  const addOrIncrement = useCallback(
    (product, lot, expiry, qty) => {
      setItems((prev) => {
        const idx = prev.findIndex(
          (i) => i.sku === product.sku && i.lot === lot && i.branch === branch
        )
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = { ...next[idx], qty: next[idx].qty + qty }
          showToast(`${product.name} (${lot}) quantity increased to ${next[idx].qty}`)
          return next
        }
        showToast(`${product.name} (${lot}) added to receive list`)
        return [...prev, { sku: product.sku, name: product.name, lot, expiry, qty, branch }]
      })
    },
    [branch, showToast]
  )

  const handleScanResult = useCallback(
    (rawValue) => {
      const product = lookupBySku(rawValue)
      if (product) {
        addOrIncrement(product, product.defaultLot, product.defaultExpiry, 1)
        setShowScanner(false)
      } else {
        // Unknown barcode: don't silently drop it — route to manual entry
        // pre-filled with the scanned value, matching the architecture doc's
        // fallback behavior for non-catalog barcodes.
        setUnknownSku(rawValue)
        setManualSku(rawValue)
        setShowScanner(false)
      }
    },
    [addOrIncrement]
  )

  const handleManualAdd = () => {
    const sku = manualSku.trim()
    const lot = manualLot.trim()
    if (!sku || !lot || !manualExpiry) {
      showToast('Fill in SKU, lot number, and expiry date')
      return
    }
    const known = lookupBySku(sku)
    const product = known || { sku, name: sku }
    addOrIncrement(product, lot, manualExpiry, Number(manualQty) || 1)
    setManualSku('')
    setManualLot('')
    setManualExpiry('')
    setManualQty(1)
    setUnknownSku(null)
  }

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = () => {
    const totalQty = items.reduce((s, i) => s + i.qty, 0)
    showToast(`${items.length} lot(s), ${totalQty} units posted to ${branch} stock`)
    window.setTimeout(() => setItems([]), 1400)
  }

  const totalQty = items.reduce((s, i) => s + i.qty, 0)

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Receive stock</h1>
          <p style={styles.subtitle}>Scan or enter incoming inventory</p>
        </div>
        <select value={branch} onChange={(e) => setBranch(e.target.value)} style={styles.branchSelect}>
          {BRANCHES.map((b) => (
            <option key={b.code} value={b.code}>
              {b.name} ({b.code})
            </option>
          ))}
        </select>
      </header>

      {toast && <div style={styles.toast}>{toast}</div>}

      <section style={styles.scanCard}>
        <button style={styles.scanButton} onClick={() => setShowScanner(true)}>
          <span style={styles.scanIcon}>▣</span>
          Open camera to scan
        </button>
        <p style={styles.scanHint}>
          Demo catalog: try scanning by typing one of these SKUs in manual entry —{' '}
          {Object.keys(CATALOG).join(', ')}
        </p>
      </section>

      <section style={styles.manualCard}>
        <div style={styles.manualHeader}>
          <h2 style={styles.h2}>Manual entry</h2>
          {unknownSku && (
            <span style={styles.unknownBadge}>Unrecognized barcode — confirm details</span>
          )}
        </div>
        <div style={styles.formGrid}>
          <Field label="SKU">
            <input
              value={manualSku}
              onChange={(e) => setManualSku(e.target.value)}
              placeholder="e.g. BOTOX-50U"
              style={styles.input}
            />
          </Field>
          <Field label="Lot number">
            <input
              value={manualLot}
              onChange={(e) => setManualLot(e.target.value)}
              placeholder="e.g. LOT-A2291"
              style={styles.input}
            />
          </Field>
          <Field label="Expiry date">
            <input
              type="date"
              value={manualExpiry}
              onChange={(e) => setManualExpiry(e.target.value)}
              style={styles.input}
            />
          </Field>
          <Field label="Quantity">
            <input
              type="number"
              min="1"
              value={manualQty}
              onChange={(e) => setManualQty(e.target.value)}
              style={styles.input}
            />
          </Field>
        </div>
        <button style={styles.addButton} onClick={handleManualAdd}>
          Add to receive list
        </button>
      </section>

      <section>
        <div style={styles.listHeader}>
          <h2 style={styles.h2}>Items received this session</h2>
          <span style={styles.lineCount}>
            {items.length} {items.length === 1 ? 'line' : 'lines'}
            {items.length > 0 && ` · ${totalQty} units`}
          </span>
        </div>

        {items.length === 0 ? (
          <div style={styles.emptyState}>No items yet — scan or enter a product above</div>
        ) : (
          <div style={styles.itemsList}>
            {items.map((it, idx) => {
              const expWarn = monthsUntil(it.expiry) < 3
              return (
                <div key={idx} style={styles.itemRow}>
                  <div>
                    <div style={styles.itemName}>{it.name}</div>
                    <div style={styles.itemMeta}>
                      {it.lot} · exp {it.expiry}
                      {expWarn && <span style={styles.expiryWarn}> (within 3mo)</span>}
                    </div>
                  </div>
                  <div style={styles.itemRight}>
                    <span style={styles.qtyBadge}>×{it.qty}</span>
                    <button
                      onClick={() => removeItem(idx)}
                      aria-label="Remove item"
                      style={styles.removeBtn}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {items.length > 0 && (
          <button style={styles.submitButton} onClick={handleSubmit}>
            Confirm and post to stock
          </button>
        )}
      </section>

      {showScanner && (
        <BarcodeScanner onDetect={handleScanResult} onClose={() => setShowScanner(false)} />
      )}

      <footer style={styles.footer}>
        Prototype — in-memory only, no backend. See the architecture doc for the production data
        model (stock_lots, stock_movements).
      </footer>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label style={styles.fieldLabel}>
      {label}
      {children}
    </label>
  )
}

const styles = {
  page: {
    maxWidth: 480,
    margin: '0 auto',
    padding: '20px 16px 40px',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 600,
    margin: 0,
  },
  subtitle: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    margin: '2px 0 0',
  },
  branchSelect: {
    flexShrink: 0,
  },
  toast: {
    fontSize: 13,
    color: 'var(--success)',
    background: 'var(--success-bg)',
    borderRadius: 8,
    padding: '8px 12px',
    marginBottom: 12,
  },
  scanCard: {
    background: 'var(--surface)',
    border: '0.5px solid var(--border)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  scanButton: {
    width: '100%',
    padding: '14px',
    fontSize: 15,
    fontWeight: 500,
    background: 'var(--accent-bg)',
    color: 'var(--accent-text)',
    border: '0.5px solid var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  scanIcon: {
    fontSize: 16,
  },
  scanHint: {
    fontSize: 12,
    color: 'var(--text-tertiary)',
    marginTop: 10,
    marginBottom: 0,
    lineHeight: 1.5,
  },
  manualCard: {
    background: 'var(--surface)',
    border: '0.5px solid var(--border)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  manualHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  h2: {
    fontSize: 15,
    fontWeight: 500,
    margin: 0,
  },
  unknownBadge: {
    fontSize: 11,
    color: 'var(--warning)',
    background: 'var(--warning-bg)',
    borderRadius: 6,
    padding: '3px 8px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    marginBottom: 12,
  },
  fieldLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    fontSize: 12,
    color: 'var(--text-secondary)',
  },
  input: {
    width: '100%',
  },
  addButton: {
    width: '100%',
  },
  listHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  lineCount: {
    fontSize: 13,
    color: 'var(--text-secondary)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '32px 16px',
    color: 'var(--text-tertiary)',
    fontSize: 13,
    border: '0.5px dashed var(--border-strong)',
    borderRadius: 12,
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'var(--surface)',
    border: '0.5px solid var(--border)',
    borderRadius: 8,
    padding: '10px 12px',
  },
  itemName: {
    fontSize: 14,
    fontWeight: 500,
  },
  itemMeta: {
    fontSize: 12,
    color: 'var(--text-secondary)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  expiryWarn: {
    color: 'var(--warning)',
    fontFamily: 'inherit',
  },
  itemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  qtyBadge: {
    fontSize: 14,
    fontWeight: 500,
    background: 'var(--accent-bg)',
    color: 'var(--accent-text)',
    borderRadius: 8,
    padding: '3px 10px',
  },
  removeBtn: {
    padding: '4px 8px',
    fontSize: 12,
  },
  submitButton: {
    width: '100%',
    marginTop: 14,
    padding: '12px',
    fontWeight: 500,
    background: 'var(--success-bg)',
    color: 'var(--success)',
    border: '0.5px solid var(--success)',
  },
  footer: {
    marginTop: 32,
    fontSize: 11,
    color: 'var(--text-tertiary)',
    textAlign: 'center',
    lineHeight: 1.6,
  },
}
