import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '@/hooks/useGame'
import { useAudio } from '@/hooks/useAudio'
import Avatar from '@/components/avatar/Avatar'
import {
  STYLES, styleOf, randomAvatar, sanitizeAvatar, saveAvatar,
} from '@/lib/avatar'

// Pestañas del estudio por estilo: qué campos tiene cada una y cómo se muestran
const BG_TAB = { key: 'fondo', label: 'Fondo', glyph: '✦', sections: [
  { field: 'bg', label: 'Color del retrato', kind: 'swatch' },
]}

const STYLE_TABS = {
  noir: [
    { key: 'rostro', label: 'Rostro', glyph: '◐', sections: [
      { field: 'skin',   label: 'Tono de piel',     kind: 'swatch' },
      { field: 'face',   label: 'Forma de la cara', kind: 'thumb', framing: 'head' },
      { field: 'detail', label: 'Detalle',          kind: 'thumb', framing: 'head' },
    ]},
    { key: 'pelo', label: 'Pelo', glyph: '≋', sections: [
      { field: 'hair',       label: 'Peinado',      kind: 'thumb', framing: 'head' },
      { field: 'hairColor',  label: 'Color',        kind: 'swatch' },
      { field: 'facialHair', label: 'Vello facial', kind: 'thumb', framing: 'mouth' },
    ]},
    { key: 'ojos', label: 'Mirada', glyph: '◉', sections: [
      { field: 'eyes',     label: 'Ojos',          kind: 'thumb', framing: 'eyes' },
      { field: 'eyeColor', label: 'Color de ojos', kind: 'swatch' },
      { field: 'brows',    label: 'Cejas',         kind: 'thumb', framing: 'eyes' },
      { field: 'eyewear',  label: 'Gafas',         kind: 'thumb', framing: 'eyes' },
    ]},
    { key: 'boca', label: 'Boca', glyph: '◡', sections: [
      { field: 'mouth', label: 'Expresión', kind: 'thumb', framing: 'mouth' },
      { field: 'nose',  label: 'Nariz',     kind: 'thumb', framing: 'mouth' },
    ]},
    { key: 'ropa', label: 'Ropa', glyph: '♦', sections: [
      { field: 'outfit',      label: 'Prenda',    kind: 'thumb', framing: 'body' },
      { field: 'outfitColor', label: 'Color',     kind: 'swatch' },
      { field: 'neckwear',    label: 'Al cuello', kind: 'thumb', framing: 'body' },
    ]},
    { key: 'sombrero', label: 'Sombreros', glyph: '♠', sections: [
      { field: 'headwear', label: 'Sombrero o adorno', kind: 'thumb', framing: 'full' },
    ]},
    { key: 'extras', label: 'Accesorios', glyph: '✚', sections: [
      { field: 'gear', label: 'Accesorio', kind: 'thumb', framing: 'bust' },
    ]},
    BG_TAB,
  ],
  operator: [
    { key: 'equipo', label: 'Equipo', glyph: '🪖', sections: [
      { field: 'opHead', label: 'Cabeza',        kind: 'thumb', framing: 'full' },
      { field: 'opEyes', label: 'Visión',        kind: 'thumb', framing: 'head' },
      { field: 'opFace', label: 'Cara',          kind: 'thumb', framing: 'head' },
      { field: 'opGear', label: 'Equipo extra',  kind: 'thumb', framing: 'tight' },
    ]},
    { key: 'camo', label: 'Camuflaje', glyph: '▦', sections: [
      { field: 'opCamo',   label: 'Patrón',          kind: 'swatch' },
      { field: 'opAccent', label: 'Luces y visores', kind: 'swatch' },
      { field: 'skin',     label: 'Tono de piel',    kind: 'swatch' },
    ]},
    BG_TAB,
  ],
  armor: [
    { key: 'casco', label: 'Casco', glyph: '⛉', sections: [
      { field: 'arHelmet', label: 'Modelo', kind: 'thumb', framing: 'tight' },
      { field: 'arCrest',  label: 'Cresta', kind: 'thumb', framing: 'full' },
      { field: 'arMark',   label: 'Marcas', kind: 'thumb', framing: 'full' },
    ]},
    { key: 'colores', label: 'Colores', glyph: '◆', sections: [
      { field: 'arColor', label: 'Armadura', kind: 'swatch' },
      { field: 'arVisor', label: 'Visor',    kind: 'swatch' },
    ]},
    BG_TAB,
  ],
  block: [
    { key: 'tipo', label: 'Personaje', glyph: '▣', sections: [
      { field: 'bkType', label: 'Tipo',    kind: 'thumb', framing: 'tight' },
      { field: 'bkTop',  label: 'Arriba',  kind: 'thumb', framing: 'full' },
    ]},
    { key: 'colores', label: 'Colores', glyph: '◆', sections: [
      { field: 'skin',    label: 'Piel (constructor)',    kind: 'swatch' },
      { field: 'bkColor', label: 'Pelo · slime · musgo · penacho', kind: 'swatch' },
      { field: 'bkShirt', label: 'Ropa',                  kind: 'swatch' },
      { field: 'bkEyes',  label: 'Ojos',                  kind: 'swatch' },
    ]},
    BG_TAB,
  ],
  robot: [
    { key: 'cabeza', label: 'Cabeza', glyph: '⚙', sections: [
      { field: 'rbHead', label: 'Modelo', kind: 'thumb', framing: 'tight' },
      { field: 'rbEyes', label: 'Ojos',   kind: 'thumb', framing: 'head' },
      { field: 'rbTop',  label: 'Arriba', kind: 'thumb', framing: 'full' },
    ]},
    { key: 'colores', label: 'Colores', glyph: '◆', sections: [
      { field: 'rbMetal', label: 'Metal', kind: 'swatch' },
      { field: 'rbLight', label: 'Luces', kind: 'swatch' },
    ]},
    BG_TAB,
  ],
  mystic: [
    { key: 'capucha', label: 'Capucha', glyph: '☾', sections: [
      { field: 'myHood', label: 'Silueta', kind: 'thumb', framing: 'full' },
      { field: 'myMask', label: 'Rostro',  kind: 'thumb', framing: 'head' },
      { field: 'myAura', label: 'Aura',    kind: 'thumb', framing: 'full' },
    ]},
    { key: 'colores', label: 'Colores', glyph: '◆', sections: [
      { field: 'myColor', label: 'Túnica', kind: 'swatch' },
      { field: 'myGlow',  label: 'Brillo', kind: 'swatch' },
    ]},
    BG_TAB,
  ],
}

const MOOD_TESTS = [[null, '🙂'], ['happy', '😄'], ['love', '😍'], ['sad', '😢'], ['shock', '😱'], ['angry', '😠'], ['think', '🤔'], ['dizzy', '😵'], ['win', '🏆']]

// Marco art deco del retrato grande
function DecoFrame({ children, size }) {
  return (
    <div className="relative" style={{ width: size + 28, height: size + 28 }}>
      {/* halo */}
      <div className="absolute inset-0 rounded-full"
        style={{ boxShadow: '0 0 60px rgba(201,168,76,0.18), 0 20px 50px rgba(0,0,0,0.6)' }} />
      {/* anillos */}
      <div className="absolute inset-0 rounded-full border-2 border-gold-500" />
      <div className="absolute inset-[6px] rounded-full border border-gold-600/50" />
      {/* rombos cardinales */}
      {[0, 90, 180, 270].map(a => (
        <div key={a} className="absolute left-1/2 top-1/2 w-3 h-3 -ml-1.5 -mt-1.5"
          style={{ transform: `rotate(${a}deg) translateY(-${size / 2 + 14}px) rotate(45deg)` }}>
          <div className="w-full h-full bg-gold-500 border border-noir-900" />
        </div>
      ))}
      {/* retrato */}
      <div className="absolute rounded-full overflow-hidden" style={{ inset: 14 }}>
        {children}
      </div>
    </div>
  )
}

function Swatch({ color, label, selected, onClick }) {
  return (
    <button onClick={onClick} title={label} aria-label={label} aria-pressed={selected}
      className="flex flex-col items-center gap-1.5 group">
      <span className={`relative w-10 h-10 rounded-full transition-all
                        ${selected ? 'ring-2 ring-gold-500 ring-offset-2 ring-offset-noir-700 scale-110' : 'ring-1 ring-noir-500 group-hover:ring-gold-600'}`}
        style={{ background: `radial-gradient(circle at 35% 30%, ${color}ee, ${color} 55%, #000a 140%)` }} />
      <span className={`text-[10px] font-sans ${selected ? 'text-gold-400' : 'text-warm-600'}`}>{label}</span>
    </button>
  )
}

function Thumb({ avatar, nickname, framing, label, selected, onClick }) {
  return (
    <button onClick={onClick} aria-pressed={selected}
      className="flex flex-col items-center gap-1.5 group">
      <span className={`relative block rounded-[14px] overflow-hidden transition-all bg-noir-800
                        ${selected
                          ? 'ring-2 ring-gold-500 shadow-[0_0_16px_rgba(201,168,76,0.35)]'
                          : 'ring-1 ring-noir-600 group-hover:ring-gold-600 group-active:scale-95'}`}
        style={{ width: 68, height: 68 }}>
        <Avatar avatar={avatar} seed={nickname} size={68} framing={framing} />
        {selected && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gold-500 text-noir-900 text-[10px]
                           flex items-center justify-center font-bold">✓</span>
        )}
      </span>
      <span className={`text-[10px] font-sans leading-tight text-center max-w-[72px]
                        ${selected ? 'text-gold-400' : 'text-warm-600'}`}>{label}</span>
    </button>
  )
}

export default function AvatarStudio() {
  const navigate = useNavigate()
  const { state, dispatch } = useGame()
  const { play } = useAudio()
  const nickname = state.nickname || 'Jugador'

  const initial = useMemo(() => sanitizeAvatar(state.avatar, nickname), []) // eslint-disable-line react-hooks/exhaustive-deps
  const [draft, setDraft] = useState(initial)
  const [byStyle, setByStyle] = useState(() => ({ [initial.style]: initial }))   // lo último editado en cada estilo
  const [tab, setTab] = useState(STYLE_TABS[initial.style][0].key)
  const [spin, setSpin] = useState(0)
  const [previewMood, setPreviewMood] = useState(null)

  const tabs = STYLE_TABS[draft.style] ?? STYLE_TABS.noir
  const current = tabs.find(t => t.key === tab) ?? tabs[0]
  const fields = styleOf(draft.style).fields
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial)

  // Vistas previas de cada estilo (lo que ya editaste o uno fijo por tu nombre)
  const previews = useMemo(() => Object.fromEntries(STYLES.map(st => [
    st.key, byStyle[st.key] ?? randomAvatar(`${nickname}-${st.key}`, st.key),
  ])), [byStyle, nickname])

  const update = (next) => {
    setDraft(next)
    setByStyle(b => ({ ...b, [next.style]: next }))
  }
  const set = (field, value) => update({ ...draft, [field]: value })

  const pickStyle = (key) => {
    if (key === draft.style) return
    play('card_flip')
    setSpin(s => s + 1)
    const next = { ...previews[key], bg: draft.bg }
    update(next)
    setTab(STYLE_TABS[key][0].key)
  }

  const randomize = () => {
    play('card_flip')
    setSpin(s => s + 1)
    update(randomAvatar(undefined, draft.style))
  }

  const reset = () => {
    const auto = sanitizeAvatar(null, nickname)
    update(auto)
    setTab(STYLE_TABS[auto.style][0].key)
  }

  const save = () => {
    saveAvatar(draft)
    dispatch({ type: 'SET_PLAYER_INFO', payload: { avatar: draft } })
    play('stand')
    navigate(-1)
  }

  return (
    <div className="min-h-[100dvh] bg-noir-900 flex flex-col">
      {/* Barra superior */}
      <header className="sticky top-0 z-20 bg-noir-900/95 backdrop-blur border-b border-noir-600">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-warm-600 hover:text-gold-500 transition-colors">←</button>
          <div className="flex-1 min-w-0">
            <p className="label-muted leading-none">Estudio</p>
            <h1 className="font-serif text-lg text-cream leading-tight">Tu personaje</h1>
          </div>
          <button onClick={randomize}
            className="h-9 px-3 rounded-btn border border-noir-500 text-warm-400 hover:border-gold-600 hover:text-gold-400
                       font-sans text-sm transition-colors active:scale-95">
            🎲 Al azar
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto md:grid md:grid-cols-[320px_1fr] md:gap-8 md:px-4 md:py-6">
        {/* Retrato */}
        <section className="flex flex-col items-center pt-6 pb-4 md:sticky md:top-20 md:self-start">
          <div key={spin} className="animate-fade-in">
            <DecoFrame size={176}>
              <Avatar avatar={draft} seed={nickname} size={176} framing="full" animated mood={previewMood} />
            </DecoFrame>
          </div>
          <div className="mt-4 px-4 py-1 rounded-pill border border-gold-600/60 bg-noir-800 flex items-center gap-2">
            <span className="font-serif text-gold-400 text-base">{nickname}</span>
            <span className="text-[10px] font-sans uppercase tracking-wider text-warm-600">{styleOf(draft.style).label}</span>
          </div>
          {/* Probar expresiones */}
          <div className="mt-3 flex flex-wrap justify-center gap-1 max-w-[300px]">
            {MOOD_TESTS.map(([m, g]) => (
              <button key={g} onClick={() => setPreviewMood(m)} title="Probar expresión"
                className={`w-8 h-8 rounded-full text-base transition-colors ${previewMood === m ? 'bg-gold-500/20 ring-1 ring-gold-500' : 'hover:bg-noir-800'}`}>
                {g}
              </button>
            ))}
          </div>
          <button onClick={reset}
            className="mt-2 text-[11px] font-sans text-warm-600 hover:text-gold-500 transition-colors">
            ↺ Volver a mi personaje automático
          </button>
        </section>

        {/* Editor */}
        <section className="flex flex-col min-w-0">
          {/* Estilos */}
          <div className="px-4 pt-2 pb-3 md:px-0">
            <div className="flex items-center gap-3 mb-2">
              <p className="label-muted">Estilo</p>
              <div className="flex-1 h-px bg-noir-600" />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {STYLES.map(st => {
                const on = st.key === draft.style
                return (
                  <button key={st.key} onClick={() => pickStyle(st.key)} aria-pressed={on}
                    className={`flex-shrink-0 w-[84px] rounded-[14px] p-1.5 pb-2 border transition-all text-center
                      ${on ? 'border-gold-500 bg-gold-500/10 shadow-[0_0_16px_rgba(201,168,76,0.25)]'
                           : 'border-noir-600 bg-noir-800 hover:border-gold-600 active:scale-95'}`}>
                    <span className="block rounded-[10px] overflow-hidden mx-auto" style={{ width: 70, height: 70 }}>
                      <Avatar avatar={previews[st.key]} seed={nickname} size={70} framing="bust" animated={on} />
                    </span>
                    <span className={`block mt-1 text-[11px] font-sans leading-tight ${on ? 'text-gold-400' : 'text-cream'}`}>{st.label}</span>
                    <span className="block text-[9px] font-sans text-warm-600 leading-tight mt-0.5">{st.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Pestañas */}
          <nav className="sticky top-14 md:top-20 z-10 bg-noir-900 border-y border-noir-600 md:border md:rounded-card md:bg-noir-800">
            <div className="flex gap-1 overflow-x-auto no-scrollbar px-3 py-2">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`flex-shrink-0 flex items-center gap-1.5 h-9 px-3 rounded-pill font-sans text-sm transition-colors
                    ${current.key === t.key
                      ? 'bg-gold-500 text-noir-900 font-medium'
                      : 'text-warm-400 hover:text-cream hover:bg-noir-700'}`}>
                  <span className="font-serif">{t.glyph}</span>{t.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Secciones */}
          <div key={`${draft.style}-${current.key}`} className="px-4 py-5 flex flex-col gap-6 animate-fade-in pb-28">
            {current.sections.map(sec => {
              const options = fields[sec.field] ?? []
              return (
                <div key={sec.field}>
                  <div className="flex items-center gap-3 mb-3">
                    <p className="label-muted">{sec.label}</p>
                    <div className="flex-1 h-px bg-noir-600" />
                  </div>
                  {sec.kind === 'swatch' ? (
                    <div className="flex flex-wrap gap-x-4 gap-y-3">
                      {options.map(o => (
                        <Swatch key={o.key} color={o.color} label={o.label}
                          selected={draft[sec.field] === o.key} onClick={() => set(sec.field, o.key)} />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-x-2 gap-y-3 justify-items-center">
                      {options.map(o => (
                        <Thumb key={o.key}
                          avatar={{ ...draft, [sec.field]: o.key }}
                          nickname={nickname}
                          framing={sec.framing}
                          label={o.label}
                          selected={draft[sec.field] === o.key}
                          onClick={() => set(sec.field, o.key)} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </main>

      {/* Barra inferior */}
      <footer className="fixed bottom-0 inset-x-0 z-30 bg-noir-900/95 backdrop-blur border-t border-noir-600">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <p className="flex-1 text-xs font-sans text-warm-600 truncate">
            {dirty ? 'Tienes cambios sin guardar' : 'Así te verán en la mesa'}
          </p>
          <button onClick={() => navigate(-1)} className="btn-outline !py-2.5 !px-4 text-sm">Cancelar</button>
          <button onClick={save} className="btn-gold !py-2.5 !px-5 text-sm">Guardar</button>
        </div>
      </footer>
    </div>
  )
}
