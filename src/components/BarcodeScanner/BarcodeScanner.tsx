import { useEffect, useRef, useState } from 'react'

type BarcodeDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>
}

declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats?: string[] }) => BarcodeDetectorLike
  }
}

export function BarcodeScanner({ onDetected }: { onDetected: (barcode: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [manual, setManual] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    let cancelled = false
    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('Caméra indisponible : utilisez la saisie manuelle.')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
        if (cancelled) return stream.getTracks().forEach((track) => track.stop())
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        if (!window.BarcodeDetector) {
          setStatus('Scanner natif non disponible : utilisez la saisie manuelle.')
          return
        }
        const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e'] })
        const scan = async () => {
          if (cancelled || !videoRef.current) return
          try {
            const codes = await detector.detect(videoRef.current)
            if (codes[0]?.rawValue) onDetected(codes[0].rawValue)
          } catch { /* continue scanning */ }
          window.setTimeout(scan, 350)
        }
        scan()
      } catch {
        setStatus('Accès caméra refusé ou indisponible.')
      }
    }
    start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [onDetected])

  return <div className="scanner-box">
    <video ref={videoRef} muted playsInline className="scanner-video" />
    {status && <small>{status}</small>}
    <form onSubmit={(event) => { event.preventDefault(); if (manual.trim()) { onDetected(manual.trim()); setManual('') } }} className="scanner-manual">
      <input value={manual} onChange={(event) => setManual(event.target.value)} placeholder="Code-barres manuel..." inputMode="numeric" />
      <button type="submit">Ajouter</button>
    </form>
  </div>
}
