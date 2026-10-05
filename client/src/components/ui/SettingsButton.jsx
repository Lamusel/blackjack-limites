import { useState } from 'react'
import SettingsModal from './SettingsModal'
import { useAudio } from '@/hooks/useAudio'

// Botón de engranaje que abre el panel de ajustes.
// Usa useAudio para que los cambios de música apliquen en cualquier pantalla.
export default function SettingsButton({ className = '' }) {
  const [open, setOpen] = useState(false)
  useAudio()

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Ajustes"
        className={`w-9 h-9 rounded-full flex items-center justify-center text-warm-600
                    hover:text-gold-500 hover:bg-noir-800 transition-colors ${className}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33
                   1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06
                   a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09
                   A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06
                   A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51
                   1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9
                   a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
      <SettingsModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
