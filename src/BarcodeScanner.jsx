import { useEffect, useRef, useState } from 'react'

// Uses the browser's native BarcodeDetector API (supported in Chrome/Edge on
// Android and desktop; not yet supported in Safari or Firefox as of writing).
// Falls back to a clear "not supported, use manual entry" message rather than
// silently failing — this mirrors the fallback behavior described in the
// architecture doc's barcode scanning section.

export default function BarcodeScanner({ onDetect, onClose }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const [status, setStatus] = useState('starting') // starting | scanning | unsupported | denied | error
  const [lastCode, setLastCode] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function start() {
      if (!('BarcodeDetector' in window)) {
        setStatus('unsupported')
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setStatus('scanning')

        const detector = new window.BarcodeDetector({
          formats: ['code_128', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code', 'data_matrix'],
        })

        const tick = async () => {
          if (cancelled || !videoRef.current) return
          try {
            const codes = await detector.detect(videoRef.current)
            if (codes.length > 0) {
              const value = codes[0].rawValue
              setLastCode(value)
              onDetect(value)
            }
          } catch {
            // detection errors on a transient frame are expected; keep scanning
          }
          rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
      } catch (err) {
        if (err && err.name === 'NotAllowedError') {
          setStatus('denied')
        } else {
          setStatus('error')
        }
      }
    }

    start()

    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
    }
  }, [onDetect])

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <span style={styles.headerTitle}>Scan barcode</span>
          <button onClick={onClose} aria-label="Close scanner" style={styles.closeBtn}>
            ✕
          </button>
        </div>

        {status === 'scanning' && (
          <div style={styles.videoWrap}>
            <video ref={videoRef} style={styles.video} muted playsInline />
            <div style={styles.scanGuide} />
            {lastCode && <div style={styles.detectedBadge}>Detected: {lastCode}</div>}
          </div>
        )}

        {status === 'starting' && (
          <div style={styles.message}>Requesting camera access…</div>
        )}

        {status === 'denied' && (
          <div style={styles.message}>
            Camera access was denied. Allow camera permission in your browser settings, or use
            manual entry instead.
          </div>
        )}

        {status === 'error' && (
          <div style={styles.message}>
            Could not start the camera on this device. Use manual entry instead.
          </div>
        )}

        {status === 'unsupported' && (
          <div style={styles.message}>
            Your browser doesn't support live barcode scanning yet (this works on Chrome for
            Android and recent desktop Chrome/Edge). Use manual entry instead — production builds
            would add a JS decoder library such as ZXing-js to cover Safari and Firefox.
          </div>
        )}

        <button onClick={onClose} style={styles.cancelBtn}>
          Cancel
        </button>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: 16,
  },
  panel: {
    background: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 420,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '0.5px solid #e2e0d9',
  },
  headerTitle: {
    fontWeight: 500,
    fontSize: 15,
  },
  closeBtn: {
    border: 'none',
    background: 'transparent',
    fontSize: 16,
    padding: 4,
    lineHeight: 1,
  },
  videoWrap: {
    position: 'relative',
    background: '#000',
    aspectRatio: '3 / 4',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  scanGuide: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    bottom: '30%',
    border: '2px solid rgba(255,255,255,0.8)',
    borderRadius: 8,
  },
  detectedBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    background: 'rgba(59,109,17,0.9)',
    color: '#fff',
    fontSize: 12,
    padding: '6px 10px',
    borderRadius: 6,
    textAlign: 'center',
  },
  message: {
    padding: '24px 20px',
    fontSize: 13,
    color: '#6b6960',
    lineHeight: 1.6,
  },
  cancelBtn: {
    width: '100%',
    borderRadius: 0,
    border: 'none',
    borderTop: '0.5px solid #e2e0d9',
    padding: '12px',
  },
}
