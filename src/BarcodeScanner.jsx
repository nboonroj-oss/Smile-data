import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function BarcodeScanner({ onDetect, onClose }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { 
      fps: 10, 
      qrbox: { width: 250, height: 250 } 
    }, false);

    scanner.render(
      (decodedText) => {
        onDetect(decodedText);
        scanner.clear(); // สแกนได้แล้วให้ปิดกล้อง
      },
      (error) => {
        // ไม่ต้องทำอะไรหากสแกนไม่เจอ (มันจะรัน error ทุก frame ที่ไม่เจอโค้ด)
      }
    );

    return () => {
      scanner.clear().catch(err => console.error(err));
    };
  }, [onDetect]);

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        <div id="reader" style={{ width: '100%' }}></div>
        <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
      </div>
    </div>
  );
}
// ... คง style เดิมไว้
