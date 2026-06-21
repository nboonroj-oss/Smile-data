import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { parseGS1Barcode } from './utils/gs1Parser'; // Import your new utility

export default function BarcodeScanner({ onScanSuccess, onClose }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
    
    scanner.render((decodedText) => {
      // Parse the raw text immediately upon scanning
      const parsedData = parseGS1Barcode(decodedText);
      
      // Pass the structured data to your parent component
      onScanSuccess(parsedData);
      
      // Close after success
      scanner.clear();
      onClose();
    });

    return () => { scanner.clear(); };
  }, [onScanSuccess, onClose]);

  return <div id="reader" />;
}
