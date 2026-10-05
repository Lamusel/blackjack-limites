// ─────────────────────────────────────────────────────────────
// Temas del juego (fuente única para el servidor)
// Las claves deben coincidir con el check de supabase/schema.sql
// y con TOPICS en client/src/lib/constants.js
// ─────────────────────────────────────────────────────────────

export const TOPICS = {
  limites: {
    label: 'Límites',
    levels: {
      easy:     'límite por sustitución directa (polinomios, trigonométricas simples)',
      medium:   'indeterminación 0/0 resuelta por factorización',
      hard:     'indeterminación resuelta por racionalización o límite trigonométrico notable (sen(x)/x)',
      advanced: 'límite al infinito de funciones racionales o límites laterales',
    },
    format: 'Calcula $$\\lim_{x\\to a} f(x)$$',
  },
  continuidad: {
    label: 'Continuidad',
    levels: {
      easy:     'identificar si una función simple es continua en un punto o dónde es discontinua',
      medium:   'clasificar una discontinuidad (evitable, de salto, infinita) o redefinir f(a) para hacerla continua',
      hard:     'hallar una constante k para que una función a trozos sea continua',
      advanced: 'hallar dos constantes en una función a trozos de tres partes, o analizar varias discontinuidades',
    },
    format: 'Pregunta sobre continuidad de $f(x)$ en $x=a$ (funciones a trozos con \\begin{cases})',
  },
  derivadas_basicas: {
    label: 'Derivadas (derivación directa)',
    levels: {
      easy:     'regla de la potencia y suma de términos',
      medium:   'regla del producto o potencias fraccionarias/negativas',
      hard:     'regla del cociente o producto con eˣ / ln(x)',
      advanced: 'cociente con trigonométricas o segunda derivada',
    },
    format: 'Deriva $$f(x)=\\dots$$',
  },
  regla_cadena: {
    label: 'Regla de la cadena',
    levels: {
      easy:     'cadena simple: (ax + b)ⁿ o sen(ax)',
      medium:   'cadena con exponencial o raíz: e^(g(x)), √(g(x))',
      hard:     'cadena con logaritmo o polinomio elevado: ln(g(x)), (g(x))ⁿ',
      advanced: 'cadena doble o triple: sen²(ax), e^(sen(x²))',
    },
    format: 'Deriva $$f(x)=\\dots$$',
  },
  derivadas_parciales: {
    label: 'Derivadas parciales',
    levels: {
      easy:     '∂f/∂x o ∂f/∂y de una suma de términos simples',
      medium:   'parcial de un producto xⁿyᵐ o evaluada en un punto',
      hard:     'parcial con exponencial o trigonométricas de dos variables',
      advanced: 'derivada cruzada ∂²f/∂x∂y o parcial de ln/raíz evaluada en un punto',
    },
    format: 'Si $f(x,y)=\\dots$, calcula $$\\frac{\\partial f}{\\partial x}$$',
  },
  aplicaciones_derivada: {
    label: 'Aplicaciones de la derivada',
    levels: {
      easy:     'pendiente de la recta tangente o velocidad a partir de la posición',
      medium:   'ecuación de la recta tangente o punto crítico',
      hard:     'máximos/mínimos relativos o intervalos de crecimiento',
      advanced: 'problema de optimización o razón de cambio relacionada',
    },
    format: 'Problema corto de aplicación',
  },
}

export const TOPIC_KEYS = Object.keys(TOPICS)

export const DIFFICULTIES = ['easy', 'medium', 'hard', 'advanced']
export const POINTS_MAP   = { easy: 2, medium: 4, hard: 6, advanced: 8 }

// Limpia una lista de temas recibida del cliente. Si queda vacía → todos.
export function sanitizeTopics(topics) {
  const valid = Array.isArray(topics) ? [...new Set(topics)].filter(t => TOPIC_KEYS.includes(t)) : []
  return valid.length ? valid : [...TOPIC_KEYS]
}
