import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function BarcodeScanner({ onDetect, onClose }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );
    
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        // Success callback: Trigger parent action and close scanner immediately
        onDetect(decodedText);
        scanner.clear().catch(console.error);
        onClose(); 
      },
      (error) => {
        // Ignore scan errors (common during continuous scan attempts)
      }
    );

    // Cleanup on component unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onDetect, onClose]);

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        <div id="reader" style={{ width: '100%' }}></div>
        <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
      </div>
    </div>
  );
}
