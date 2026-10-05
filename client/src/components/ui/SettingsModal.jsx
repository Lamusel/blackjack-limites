import Modal from './Modal'
import { useSettings } from '@/hooks/useSettings'

function Toggle({ label, hint, checked, onChange, disabled = false }) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={onChange}
      className="w-full flex items-center justify-between gap-4 py-3 border-b border-noir-600 last:border-0
                 text-left disabled:opacity-40 disabled:cursor-not-allowed">
      <div>
        <p className="text-cream font-sans text-sm">{label}</p>
        {hint && <p className="text-warm-600 font-sans text-xs mt-0.5">{hint}</p>}
      </div>
      <span className={`relative w-11 h-6 rounded-full border transition-colors flex-shrink-0 ${
        checked ? 'bg-noir-700 border-gold-600' : 'bg-noir-800 border-noir-600'}`}>
        <span className={`absolute top-0.5 w-[18px] h-[18px] rounded-full transition-all ${
          checked ? 'left-[22px] bg-gold-500' : 'left-0.5 bg-warm-600'}`} />
      </span>
    </button>
  )
}

export default function SettingsModal({ open, onClose }) {
  const { settings, toggle } = useSettings()

  return (
    <Modal open={open} onClose={onClose} title="Ajustes">
      <div className="flex flex-col">
        <Toggle label="Música de fondo" hint="Lounge jazz del casino"
          checked={!!settings.music} onChange={() => toggle('music')} />
        <Toggle label="Efectos de sonido" hint="Cartas, aciertos, fichas, reloj"
          checked={!!settings.sounds} onChange={() => toggle('sounds')} />

        <div className="flex items-center justify-between gap-4 py-3 opacity-40">
          <div>
            <p className="text-cream font-sans text-sm">Idioma</p>
            <p className="text-warm-600 font-sans text-xs mt-0.5">Próximamente</p>
          </div>
          <div className="flex rounded-btn border border-noir-600 overflow-hidden text-xs font-sans">
            <span className="px-3 py-1.5 bg-noir-700 text-gold-400">ES</span>
            <span className="px-3 py-1.5 text-warm-600">EN</span>
          </div>
        </div>
      </div>

      <button onClick={onClose} className="btn-gold w-full mt-4">Listo</button>
    </Modal>
  )
}
