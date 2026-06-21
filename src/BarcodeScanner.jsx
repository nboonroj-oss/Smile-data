import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

// Inside your useEffect or initialization function:
const config = {
  fps: 10,
  qrbox: { width: 250, height: 250 },
  // Explicitly allow DataMatrix and others
  formatsToSupport: [
    Html5QrcodeSupportedFormats.QR_CODE,
    Html5QrcodeSupportedFormats.DATA_MATRIX,
    Html5QrcodeSupportedFormats.CODE_128
  ]
};

const scanner = new Html5QrcodeScanner("reader", config, false);
