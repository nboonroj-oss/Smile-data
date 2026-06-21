import { useEffect } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export default function BarcodeScanner({ onScanSuccess, onClose }) {
  useEffect(() => {
    // 1. Define scanner configuration
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      // CRITICAL: Explicitly enable the formats required for medical UDI
      formatsToSupport: [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.DATA_MATRIX,
        Html5QrcodeSupportedFormats.CODE_128
      ]
    };

    // 2. Initialize the scanner
    const scanner = new Html5QrcodeScanner("reader", config, false);

    // 3. Define the success callback
    const successCallback = (decodedText) => {
      // Pass the raw text back to your parent component (StockReceive)
      // The parsing logic should happen in the parent or a utility
      onScanSuccess(decodedText);
      
      // Auto-close after successful scan
      scanner.clear().catch(console.error);
      onClose();
    };

    const errorCallback = (err) => {
      // Errors are common during scanning (e.g., frame not found), 
      // so we typically ignore them in the UI to keep it clean.
    };

    scanner.render(successCallback, errorCallback);

    // 4. Cleanup function to prevent memory leaks/camera lag
    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onScanSuccess, onClose]);

  return (
    <div id="reader" style={{ width: '100%' }}></div>
  );
}
