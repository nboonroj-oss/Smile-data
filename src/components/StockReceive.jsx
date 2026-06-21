import { useState } from 'react';
import BarcodeScanner from '../BarcodeScanner';
import { parseGS1Barcode } from '../utils/gs1Parser';

export default function StockReceive() {
  const [scannedData, setScannedData] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleDetected = (rawString) => {
    // 1. Use your parser utility
    const parsed = parseGS1Barcode(rawString);
    setScannedData(parsed);
    setShowScanner(false);
  };

  return (
    <div className="stock-receive-container">
      {/* Card 1: Scanner */}
      {!showScanner ? (
        <button onClick={() => setShowScanner(true)}>Start Scanning</button>
      ) : (
        <BarcodeScanner onScanSuccess={handleDetected} onClose={() => setShowScanner(false)} />
      )}

      {/* Card 2: Parsed Data */}
      {scannedData && (
        <div className="data-card">
          <h3>Product Details</h3>
          <p>GTIN: {scannedData.gtin}</p>
          <p>Lot: {scannedData.lot_number}</p>
          <p>Expiry: {scannedData.expiry_date}</p>
          
          {/* Card 3: Quantity */}
          <input 
            type="number" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)} 
          />
          
          {/* Card 4: Save */}
          <button onClick={() => console.log("Saving to DB:", { ...scannedData, quantity })}>
            Save to Inventory
          </button>
        </div>
      )}
    </div>
  );
}
