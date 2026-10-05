import { useNavigate } from 'react-router-dom'
import { TOPICS } from '@/lib/constants'
import { DIFFICULTY_RANGES, penaltyFor } from '@/lib/cards'
import { MiniCard } from '@/components/game/ForecastPanel'

const steps = [
  { icon: '🎯', title: 'El objetivo', desc: 'Llega exactamente a 21 puntos resolviendo ejercicios de Cálculo antes que los demás.' },
  { icon: '📊', title: 'El pronóstico', desc: 'Antes de decidir ves la probabilidad en el azar de tu turno: por ejemplo 60% carta de 2, 25% carta de 8 y el resto repartido. También te dice qué tanto riesgo tienes de pasarte. Cambia en cada turno.' },
  { icon: '🃏', title: 'Tu turno', desc: 'Decides: PEDIR CARTA o PLANTARTE (pasas este turno sin arriesgar). Al pedir, la carta se voltea para todos y te llega un ejercicio de la dificultad de esa carta. Plantarte no te saca: en la siguiente vuelta vuelves a decidir.' },
  { icon: '✅', title: 'Si aciertas', desc: 'Sumas el valor de la carta (de 2 a 9). ¡Sigue acumulando hacia 21!' },
  { icon: '❌', title: 'Si fallas', desc: 'Pierdes un tercio del valor de la carta (redondeado, mínimo 1). Solo tú ves la explicación.' },
  { icon: '✦', title: 'El As dorado', desc: 'Muy raro (1.5%). Trae un ejercicio difícil, pero si aciertas eliges si vale 1 u 11, como en el blackjack real. Si fallas solo pierdes 1.' },
  { icon: '🎯', title: 'Comodín 50/50', desc: 'Una vez por partida puedes quitar 2 opciones incorrectas de tu carta.' },
  { icon: '🍅', title: 'Reacciones', desc: 'Toca tu retrato para reaccionar (👏 😱 🔥) o toca a otro jugador para lanzarle algo: tomates, huevazos, ¡bang!, dinamita, billetes, coronas y más. Los personajes cambian de cara según lo que pase.' },
  { icon: '🏅', title: 'Rachas y medallas', desc: '3 aciertos seguidos te ponen EN RACHA 🔥. Al final ganas medallas como Francotirador o Al filo, y quedan en tu perfil.' },
  { icon: '💥', title: 'Pasarte de 21', desc: 'Si tu puntaje supera 21 quedas eliminado. ¡Cuidado con las cartas grandes!' },
  { icon: '🏆', title: '¿Cuándo termina?', desc: 'Al cerrar una vuelta: si alguno (o varios) llegó a 21, ganan ellos. Si todos se plantaron en la misma vuelta, gana el más cercano a 21 sin pasarse.' },
]

export default function HowToPlay() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-noir-900 px-4 py-8">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/')} className="text-warm-600 hover:text-gold-500 transition-colors">←</button>
          <h2 className="font-serif text-xl text-cream">Cómo jugar</h2>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {steps.map((s, i) => (
            <div key={i} className="card-noir p-4 flex gap-4">
              <span className="text-2xl flex-shrink-0">{s.icon}</span>
              <div>
                <p className="text-cream font-sans text-sm font-medium mb-1">{s.title}</p>
                <p className="text-warm-600 font-sans text-xs leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card-noir p-4 mb-6">
          <p className="label-muted mb-3">Cartas y dificultades</p>
          <div className="flex flex-col gap-2">
            {DIFFICULTY_RANGES.map(d => {
              const [lo, hi] = d.range.split('–').map(Number)
              return (
                <div key={d.key} className="flex items-center justify-between gap-2">
                  <span className={`badge-difficulty badge-${d.key}`}>{d.emoji} {d.label}</span>
                  <div className="flex items-center gap-1">
                    <MiniCard value={lo} /><MiniCard value={hi} />
                  </div>
                  <div className="flex gap-2 text-[11px] font-sans whitespace-nowrap justify-end min-w-[92px]">
                    <span className="text-win-text">+{lo}/+{hi}</span>
                    <span className="text-lose-text">−{penaltyFor(lo)}/−{penaltyFor(hi)}</span>
                  </div>
                </div>
              )
            })}
            <div className="flex items-center justify-between gap-2 pt-2 mt-1 border-t border-noir-600">
              <span className="px-2 py-0.5 rounded-pill text-[11px] font-sans border border-[#e8c35a] text-[#f3d58a] bg-[#4a3208]/60">✦ As dorado</span>
              <MiniCard value="A" gold />
              <div className="flex gap-2 text-[11px] font-sans whitespace-nowrap justify-end min-w-[92px]">
                <span className="text-[#f3d58a]">+1 u +11</span>
                <span className="text-lose-text">−1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Temas */}
        <div className="card-noir p-4 mb-6">
          <p className="label-muted mb-1">Temas · Corte 2</p>
          <p className="text-warm-600 font-sans text-xs leading-relaxed mb-3">
            El host elige qué temas entran al crear la sala. Por defecto es un mix de todos.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TOPICS.map(t => (
              <div key={t.key} className="flex items-center gap-2 rounded-btn bg-noir-800 border border-noir-600 px-3 py-2">
                <span className="font-serif text-gold-500 w-5 text-center flex-shrink-0">{t.icon}</span>
                <span className="text-cream font-sans text-xs leading-tight">{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => navigate('/')} className="btn-gold w-full">¡Listo, a jugar!</button>
      </div>
    </div>
  )
}
