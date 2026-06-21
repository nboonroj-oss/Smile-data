// Mirrors the `products` and `branches` tables from the system architecture doc.
// In the real app this would come from GET /products and GET /branches.

export const BRANCHES = [
  { code: 'BS', name: 'Chonburi' },
  { code: 'CNK', name: 'Chiang Mai' },
  { code: 'CB', name: 'Chantaburi' },
  { code: 'SL', name: 'Silom' },
  { code: 'RS', name: 'Rangsit' },
  { code: 'SRK', name: 'Srinakarin' },
  { code: 'RCP', name: 'Ratchapruk' },
  { code: 'KK', name: 'Khon Kaen' },
]

// Keyed by barcode value, so a camera scan or manual SKU entry resolves the same way.
export const CATALOG = {
  'BOTOX-50U': { sku: 'BOTOX-50U', name: 'Botox 50U', productType: 'Botox', defaultLot: 'LOT-A2291', defaultExpiry: '2027-03-15' },
  'FILLER-1ML': { sku: 'FILLER-1ML', name: 'Filler 1ml HA', productType: 'Filler', defaultLot: 'LOT-F7714', defaultExpiry: '2026-11-02' },
  'MOUNJARO-5MG': { sku: 'MOUNJARO-5MG', name: 'Mounjaro 5mg', productType: 'Mounjaro', defaultLot: 'LOT-M0083', defaultExpiry: '2026-09-20' },
  'LIPORASE-VIAL': { sku: 'LIPORASE-VIAL', name: 'Liporase vial', productType: 'Liporase', defaultLot: 'LOT-L4420', defaultExpiry: '2027-01-10' },
  'HIFU-TIP': { sku: 'HIFU-TIP', name: 'HIFU cartridge tip', productType: 'HIFU', defaultLot: 'LOT-H9012', defaultExpiry: '2027-06-30' },
}

export function lookupBySku(sku) {
  const key = sku.trim().toUpperCase()
  return CATALOG[key] || null
}

export function monthsUntil(dateStr) {
  const target = new Date(dateStr)
  const now = new Date()
  return (target - now) / (1000 * 60 * 60 * 24 * 30)
}
