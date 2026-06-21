import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function BarcodeScanner({ onDetect, onClose }) {
  useEffect(() => {
    // ต้องตรงกับ id ใน return ด้านล่าง
    const scanner = new Html5QrcodeScanner("reader", { 
      fps: 10, 
      qrbox: { width: 250, height: 250 } 
    }, false);
    
    scanner.render(
      (decodedText) => {
        onDetect(decodedText);
        scanner.clear();
      },
      (err) => { /* ลบเงื่อนไขที่โชว์ข้อความเตือนออก */ }
    );

    return () => { scanner.clear(); };
  }, [onDetect]);

  // ต้องมี div id="reader" ไม่งั้น Library จะวาดกล้องไม่ถูก
  return (
    <div>
      <div id="reader" style={{ width: '100%' }}></div>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}
