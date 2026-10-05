import { useEffect } from 'react'
import { createPortal } from 'react-dom'

// Modal genérico: cierra con Escape o tocando fuera
export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/70 animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-sm card-noir p-5 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl text-cream">{title}</h3>
          <button onClick={onClose} aria-label="Cerrar"
            className="w-8 h-8 rounded-full text-warm-600 hover:text-gold-500 hover:bg-noir-700 transition-colors">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}
