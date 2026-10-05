// ─────────────────────────────────────────────────────────────
// Avatar noir — catálogo de opciones, generación por nickname y validación
// ─────────────────────────────────────────────────────────────

export const SKIN_TONES = [
  { key: 's1', label: 'Porcelana', color: '#f6d6bd' },
  { key: 's2', label: 'Marfil',    color: '#ebbf9a' },
  { key: 's3', label: 'Miel',      color: '#d39c71' },
  { key: 's4', label: 'Canela',    color: '#b27850' },
  { key: 's5', label: 'Cacao',     color: '#8a5634' },
  { key: 's6', label: 'Ébano',     color: '#5f3a23' },
]

export const HAIR_COLORS = [
  { key: 'h1', label: 'Azabache',  color: '#1b1714' },
  { key: 'h2', label: 'Castaño',   color: '#4a2f1f' },
  { key: 'h3', label: 'Avellana',  color: '#7a4b2a' },
  { key: 'h4', label: 'Cobre',     color: '#9c4a26' },
  { key: 'h5', label: 'Rubio',     color: '#c9a55c' },
  { key: 'h6', label: 'Platino',   color: '#e3d8c1' },
  { key: 'h7', label: 'Plata',     color: '#9a958e' },
  { key: 'h8', label: 'Vino',      color: '#5e1a2a' },
]

export const EYE_COLORS = [
  { key: 'e1', label: 'Café',     color: '#4b2e1d' },
  { key: 'e2', label: 'Avellana', color: '#7a5a2e' },
  { key: 'e3', label: 'Verde',    color: '#3f6b4a' },
  { key: 'e4', label: 'Azul',     color: '#3d5f86' },
  { key: 'e5', label: 'Gris',     color: '#6c7378' },
]

export const OUTFIT_COLORS = [
  { key: 'o1', label: 'Negro',     color: '#16130f' },
  { key: 'o2', label: 'Carbón',    color: '#3a3631' },
  { key: 'o3', label: 'Vino',      color: '#5b1a26' },
  { key: 'o4', label: 'Esmeralda', color: '#1f4a3a' },
  { key: 'o5', label: 'Marino',    color: '#1d2a44' },
  { key: 'o6', label: 'Camel',     color: '#9b7650' },
  { key: 'o7', label: 'Crema',     color: '#e6dac3' },
  { key: 'o8', label: 'Oro',       color: '#b08d3e' },
]

export const BACKGROUNDS = [
  { key: 'b1', label: 'Burdeos',    color: '#5a1a28' },
  { key: 'b2', label: 'Esmeralda',  color: '#1c3d32' },
  { key: 'b3', label: 'Medianoche', color: '#1a2236' },
  { key: 'b4', label: 'Tabaco',     color: '#4a3220' },
  { key: 'b5', label: 'Grafito',    color: '#2a2724' },
  { key: 'b6', label: 'Ciruela',    color: '#3d2140' },
  { key: 'b7', label: 'Ocre',       color: '#7a5a22' },
]

export const FACE_SHAPES = [
  { key: 'oval',   label: 'Ovalado' },
  { key: 'round',  label: 'Redondo' },
  { key: 'square', label: 'Cuadrado' },
  { key: 'long',   label: 'Alargado' },
  { key: 'heart',  label: 'Corazón' },
]

export const HAIR_STYLES = [
  { key: 'slick',     label: 'Engominado' },
  { key: 'sidepart',  label: 'Raya al lado' },
  { key: 'pompadour', label: 'Tupé' },
  { key: 'waves',     label: 'Ondas 40s' },
  { key: 'bob',       label: 'Bob' },
  { key: 'long',      label: 'Largo' },
  { key: 'bun',       label: 'Moño' },
  { key: 'curly',     label: 'Rizos' },
  { key: 'afro',      label: 'Afro' },
  { key: 'middle',    label: 'Raya al medio' },
  { key: 'ponytail',  label: 'Coleta' },
  { key: 'braids',    label: 'Trenzas' },
  { key: 'shortcurl', label: 'Rizos cortos' },
  { key: 'mohawk',    label: 'Cresta' },
  { key: 'buzz',      label: 'Rapado' },
  { key: 'bald',      label: 'Calvo' },
]

export const BROWS = [
  { key: 'arched',   label: 'Arqueadas' },
  { key: 'straight', label: 'Rectas' },
  { key: 'thick',    label: 'Gruesas' },
  { key: 'raised',   label: 'Escéptica' },
  { key: 'angry',    label: 'Seria' },
]

export const EYES = [
  { key: 'calm',   label: 'Serenos' },
  { key: 'sharp',  label: 'Afilados' },
  { key: 'wide',   label: 'Grandes' },
  { key: 'sleepy', label: 'Misteriosos' },
  { key: 'lashes', label: 'Pestañas' },
  { key: 'wink',   label: 'Guiño' },
]

export const NOSES = [
  { key: 'button',   label: 'Botón' },
  { key: 'straight', label: 'Recta' },
  { key: 'roman',    label: 'Romana' },
]

export const MOUTHS = [
  { key: 'smile',     label: 'Sonrisa' },
  { key: 'smirk',     label: 'Pícara' },
  { key: 'neutral',   label: 'Neutral' },
  { key: 'grin',      label: 'Carcajada' },
  { key: 'lips',      label: 'Labios rojos' },
  { key: 'surprised', label: 'Sorpresa' },
]

export const FACIAL_HAIR = [
  { key: 'none',    label: 'Nada' },
  { key: 'pencil',  label: 'Bigote fino' },
  { key: 'mustache',label: 'Bigotón' },
  { key: 'goatee',  label: 'Candado' },
  { key: 'stubble', label: 'Barba de 3 días' },
  { key: 'beard',   label: 'Barba' },
]

export const OUTFITS = [
  { key: 'tuxedo',     label: 'Esmoquin' },
  { key: 'suit',       label: 'Traje' },
  { key: 'trench',     label: 'Gabardina' },
  { key: 'dress',      label: 'Vestido' },
  { key: 'turtleneck', label: 'Cuello alto' },
  { key: 'vest',       label: 'Chaleco' },
]

export const NECKWEAR = [
  { key: 'none',   label: 'Nada' },
  { key: 'bowtie', label: 'Corbatín' },
  { key: 'tie',    label: 'Corbata' },
  { key: 'pearls', label: 'Perlas' },
  { key: 'scarf',  label: 'Pañuelo' },
]

export const HEADWEAR = [
  { key: 'none',    label: 'Nada' },
  { key: 'fedora',  label: 'Fedora' },
  { key: 'tophat',  label: 'Chistera' },
  { key: 'beret',   label: 'Boina' },
  { key: 'cap',     label: 'Gorra' },
  { key: 'visor',   label: 'Visera de crupier' },
  { key: 'widebrim',label: 'Ala ancha' },
  { key: 'feather', label: 'Pluma' },
  { key: 'flower',  label: 'Flor' },
  { key: 'cowboy',  label: 'Vaquero' },
  { key: 'beanie',  label: 'Gorro de lana' },
  { key: 'bucket',  label: 'Pescador' },
  { key: 'bandana', label: 'Bandana' },
  { key: 'headphones', label: 'Audífonos' },
  { key: 'crown',   label: 'Corona' },
  { key: 'halo',    label: 'Aureola' },
  { key: 'horns',   label: 'Cuernos' },
  { key: 'catears', label: 'Orejas de gato' },
]

export const GEAR = [
  { key: 'none',      label: 'Nada' },
  { key: 'goldchain', label: 'Cadena de oro' },
  { key: 'medal',     label: 'Medalla' },
  { key: 'eyepatch',  label: 'Parche' },
  { key: 'mask',      label: 'Antifaz' },
  { key: 'warpaint',  label: 'Pintura de guerra' },
  { key: 'earpiece',  label: 'Audífono espía' },
  { key: 'toothpick', label: 'Palillo' },
  { key: 'bandaid',   label: 'Curita' },
]

export const EYEWEAR = [
  { key: 'none',    label: 'Nada' },
  { key: 'round',   label: 'Redondas' },
  { key: 'cateye',  label: 'Ojo de gato' },
  { key: 'shades',  label: 'Oscuras' },
  { key: 'monocle', label: 'Monóculo' },
]

export const DETAILS = [
  { key: 'none',    label: 'Nada' },
  { key: 'mole',    label: 'Lunar' },
  { key: 'freckles',label: 'Pecas' },
  { key: 'blush',   label: 'Rubor' },
  { key: 'pearl',   label: 'Aretes perla' },
  { key: 'hoops',   label: 'Argollas' },
  { key: 'scar',    label: 'Cicatriz' },
  { key: 'chip',    label: 'Ficha en la oreja' },
]

// Catálogo para el estudio (orden de las pestañas y qué opciones tiene cada campo)
export const AVATAR_FIELDS = {
  skin:       SKIN_TONES,
  face:       FACE_SHAPES,
  hair:       HAIR_STYLES,
  hairColor:  HAIR_COLORS,
  brows:      BROWS,
  eyes:       EYES,
  eyeColor:   EYE_COLORS,
  nose:       NOSES,
  mouth:      MOUTHS,
  facialHair: FACIAL_HAIR,
  outfit:     OUTFITS,
  outfitColor:OUTFIT_COLORS,
  neckwear:   NECKWEAR,
  headwear:   HEADWEAR,
  eyewear:    EYEWEAR,
  detail:     DETAILS,
  gear:       GEAR,
  bg:         BACKGROUNDS,
}

// ═════════════════════════════════════════════════════════════
// ESTILOS (tipo "imagen de jugador"): cada uno con su look marcado
// ═════════════════════════════════════════════════════════════
const C = (key, label, color) => ({ key, label, color })

// ── Táctico ──
export const OP_HEAD = [
  { key: 'helmet', label: 'Casco táctico' }, { key: 'nvg', label: 'Casco + visión nocturna' },
  { key: 'boonie', label: 'Boonie' },        { key: 'beanie', label: 'Gorro' },
  { key: 'cap',    label: 'Gorra' },         { key: 'hood', label: 'Capucha' },
  { key: 'none',   label: 'Nada' },
]
export const OP_FACE = [
  { key: 'none', label: 'Descubierto' }, { key: 'balaclava', label: 'Pasamontañas' },
  { key: 'jaw',  label: 'Máscara mandíbula' }, { key: 'gasmask', label: 'Máscara de gas' },
  { key: 'shemagh', label: 'Pañuelo táctico' }, { key: 'paint', label: 'Camuflaje facial' },
]
export const OP_EYES = [
  { key: 'none', label: 'Nada' }, { key: 'glasses', label: 'Gafas balísticas' },
  { key: 'goggles', label: 'Goggles' }, { key: 'nvgdown', label: 'Visión nocturna' },
  { key: 'visor', label: 'Visor HUD' },
]
export const OP_CAMO = [
  C('woodland', 'Bosque', '#4a5636'), C('desert', 'Desierto', '#b39a6b'), C('urban', 'Urbano', '#6f747a'),
  C('arctic', 'Ártico', '#d9dde0'), C('black', 'Ops negro', '#24262a'), C('jungle', 'Jungla', '#3b5a3a'),
]
export const OP_GEAR = [
  { key: 'none', label: 'Nada' }, { key: 'headset', label: 'Headset' }, { key: 'radio', label: 'Radio' },
  { key: 'patch', label: 'Parche' }, { key: 'dogtags', label: 'Placas' }, { key: 'sling', label: 'Correa' },
]
export const ACCENTS = [
  C('green', 'Verde', '#5cff8a'), C('red', 'Rojo', '#ff4a4a'), C('cyan', 'Cian', '#4ae3ff'),
  C('amber', 'Ámbar', '#ffb84a'), C('violet', 'Violeta', '#b76bff'), C('white', 'Blanco', '#f2f2f2'),
]

// ── Armadura ──
export const AR_HELMET = [
  { key: 'ranger', label: 'Explorador' }, { key: 'tvisor', label: 'Visor en T' },
  { key: 'dome', label: 'Domo' }, { key: 'knight', label: 'Caballero' }, { key: 'hunter', label: 'Cazador' },
]
export const AR_COLOR = [
  C('olive', 'Oliva', '#5d6b3f'), C('steel', 'Acero', '#7d868f'), C('crimson', 'Carmesí', '#8e2430'),
  C('cobalt', 'Cobalto', '#2c4c8a'), C('white', 'Blanco', '#d9dcdf'), C('black', 'Negro', '#25272b'),
  C('gold', 'Oro', '#b08d3e'), C('violet', 'Violeta', '#5a3a86'),
]
export const AR_VISOR = [
  C('gold', 'Dorado', '#f2b632'), C('cyan', 'Cian', '#39d0ff'), C('red', 'Rojo', '#ff3b3b'),
  C('violet', 'Violeta', '#b06bff'), C('green', 'Verde', '#4dff8a'), C('silver', 'Plata', '#cfd8e3'),
]
export const AR_CREST = [
  { key: 'none', label: 'Nada' }, { key: 'antenna', label: 'Antena' }, { key: 'fin', label: 'Cresta' },
  { key: 'horns', label: 'Cuernos' }, { key: 'plume', label: 'Penacho de luz' }, { key: 'lamp', label: 'Linterna' },
]
export const AR_MARK = [
  { key: 'none', label: 'Limpia' }, { key: 'stripe', label: 'Franja' }, { key: 'scratches', label: 'Rayones' },
  { key: 'number', label: 'Número' }, { key: 'chevron', label: 'Galón' }, { key: 'battle', label: 'Daño de batalla' },
]

// ── Bloques ──
export const BK_TYPE = [
  { key: 'crafter', label: 'Constructor' }, { key: 'void', label: 'Sombra' }, { key: 'slime', label: 'Slime' },
  { key: 'golem', label: 'Gólem' }, { key: 'knight', label: 'Caballero' },
]
export const BK_COLOR = [
  C('brown', 'Café', '#5a3a22'), C('black', 'Negro', '#1d1a18'), C('blond', 'Rubio', '#d6b25e'),
  C('red', 'Rojo', '#a8382a'), C('green', 'Verde', '#4caf50'), C('blue', 'Azul', '#3a6fd8'),
  C('pink', 'Rosa', '#e077b0'), C('white', 'Blanco', '#e8e6e0'),
]
export const BK_SHIRT = [
  C('cyan', 'Turquesa', '#1fa3a8'), C('red', 'Rojo', '#b0302a'), C('purple', 'Morado', '#6b3fa0'),
  C('green', 'Verde', '#3c8a3a'), C('navy', 'Marino', '#2a3a6a'), C('orange', 'Naranja', '#d0762a'),
  C('black', 'Negro', '#24221f'), C('white', 'Blanco', '#e8e4dc'),
]
export const BK_EYES = [
  C('violet', 'Violeta', '#c86bff'), C('green', 'Verde', '#5cff6a'), C('cyan', 'Cian', '#4ae3ff'),
  C('red', 'Rojo', '#ff4a4a'), C('gold', 'Oro', '#ffd24a'), C('white', 'Blanco', '#f4f4f4'),
]
export const BK_TOP = [
  { key: 'none', label: 'Nada' }, { key: 'crown', label: 'Corona' }, { key: 'cap', label: 'Gorra' },
  { key: 'headphones', label: 'Audífonos' }, { key: 'halo', label: 'Aureola' }, { key: 'horns', label: 'Cuernos' },
]

// ── Robot ──
export const RB_HEAD = [
  { key: 'box', label: 'Caja' }, { key: 'dome', label: 'Domo' }, { key: 'tv', label: 'Televisor' },
  { key: 'capsule', label: 'Cápsula' }, { key: 'mech', label: 'Mecha' },
]
export const RB_EYES = [
  { key: 'duo', label: 'Dos LEDs' }, { key: 'visor', label: 'Barra' }, { key: 'cyclops', label: 'Cíclope' },
  { key: 'screen', label: 'Pantalla' }, { key: 'lenses', label: 'Lentes' },
]
export const RB_METAL = [
  C('chrome', 'Cromo', '#b9c2cc'), C('gunmetal', 'Grafito', '#4a5058'), C('white', 'Blanco', '#e6e8ea'),
  C('red', 'Rojo', '#b8322e'), C('yellow', 'Amarillo', '#e0b52c'), C('teal', 'Turquesa', '#2a8a86'),
  C('black', 'Negro', '#1f2124'), C('copper', 'Cobre', '#b0683a'),
]
export const RB_TOP = [
  { key: 'none', label: 'Nada' }, { key: 'antenna', label: 'Antena' }, { key: 'twin', label: 'Doble antena' },
  { key: 'dish', label: 'Parabólica' }, { key: 'siren', label: 'Sirena' }, { key: 'propeller', label: 'Hélice' },
]

// ── Místico ──
export const MY_HOOD = [
  { key: 'hood', label: 'Capucha' }, { key: 'cowl', label: 'Capucha puntiaguda' }, { key: 'wizard', label: 'Mago' },
  { key: 'crown', label: 'Rey espectral' }, { key: 'horns', label: 'Cornudo' },
]
export const MY_MASK = [
  { key: 'none', label: 'Sombra' }, { key: 'porcelain', label: 'Porcelana' }, { key: 'fox', label: 'Zorro' },
  { key: 'skull', label: 'Calavera' }, { key: 'beak', label: 'Pico' },
]
export const MY_COLOR = [
  C('crimson', 'Carmesí', '#6e1a26'), C('midnight', 'Medianoche', '#1c2340'), C('forest', 'Bosque', '#1f3a2a'),
  C('ash', 'Ceniza', '#4a4846'), C('violet', 'Violeta', '#3e2457'), C('gold', 'Oro', '#7a5a22'),
  C('black', 'Negro', '#121112'), C('ivory', 'Marfil', '#cfc6b4'),
]
export const MY_AURA = [
  { key: 'none', label: 'Nada' }, { key: 'flames', label: 'Llamas' }, { key: 'runes', label: 'Runas' },
  { key: 'smoke', label: 'Humo' }, { key: 'sparks', label: 'Chispas' }, { key: 'orbs', label: 'Orbes' },
]

export const STYLES = [
  { key: 'noir',     label: 'Clásico',  desc: 'Retrato noir de casino', icon: '🎩',
    fields: AVATAR_FIELDS },
  { key: 'operator', label: 'Táctico',  desc: 'Operador de fuerzas especiales', icon: '🪖',
    fields: { skin: SKIN_TONES, opHead: OP_HEAD, opFace: OP_FACE, opEyes: OP_EYES, opCamo: OP_CAMO, opGear: OP_GEAR, opAccent: ACCENTS, bg: BACKGROUNDS } },
  { key: 'armor',    label: 'Armadura', desc: 'Soldado blindado del futuro', icon: '🛡️',
    fields: { arHelmet: AR_HELMET, arColor: AR_COLOR, arVisor: AR_VISOR, arCrest: AR_CREST, arMark: AR_MARK, bg: BACKGROUNDS } },
  { key: 'block',    label: 'Bloques',  desc: 'Personaje de píxeles', icon: '🧱',
    fields: { bkType: BK_TYPE, skin: SKIN_TONES, bkColor: BK_COLOR, bkShirt: BK_SHIRT, bkEyes: BK_EYES, bkTop: BK_TOP, bg: BACKGROUNDS } },
  { key: 'robot',    label: 'Robot',    desc: 'Máquina con personalidad', icon: '🤖',
    fields: { rbHead: RB_HEAD, rbEyes: RB_EYES, rbMetal: RB_METAL, rbLight: ACCENTS, rbTop: RB_TOP, bg: BACKGROUNDS } },
  { key: 'mystic',   label: 'Místico',  desc: 'Encapuchado de ojos brillantes', icon: '🔮',
    fields: { myHood: MY_HOOD, myMask: MY_MASK, myColor: MY_COLOR, myGlow: ACCENTS, myAura: MY_AURA, bg: BACKGROUNDS } },
]
export const STYLE_KEYS = STYLES.map(s => s.key)
export const styleOf = (key) => STYLES.find(s => s.key === key) ?? STYLES[0]

export const AVATAR_KEYS = ['style', ...new Set(STYLES.flatMap(s => Object.keys(s.fields)))]

// ── PRNG con semilla (mismo nickname → mismo avatar) ──────────
function hashString(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pickFrom = (rand, list) => list[Math.floor(rand() * list.length)].key
const pickWeighted = (rand, list, noneWeight) =>
  rand() < noneWeight ? 'none' : pickFrom(rand, list.filter(o => o.key !== 'none'))
// Elegir con pesos: { clave: peso }
function pickByWeights(rand, weights) {
  const entries = Object.entries(weights)
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let r = rand() * total
  for (const [k, w] of entries) { if ((r -= w) <= 0) return k }
  return entries[0][0]
}

function randomNoir(rand) {
  const hair = pickFrom(rand, HAIR_STYLES)
  const feminineHair = ['waves', 'bob', 'long', 'bun', 'ponytail', 'braids'].includes(hair)
  return {
    style:       'noir',
    skin:        pickFrom(rand, SKIN_TONES),
    face:        pickFrom(rand, FACE_SHAPES),
    hair,
    hairColor:   pickFrom(rand, HAIR_COLORS),
    brows:       pickFrom(rand, BROWS),
    eyes:        pickFrom(rand, EYES.filter(e => e.key !== 'wink')),
    eyeColor:    pickFrom(rand, EYE_COLORS),
    nose:        pickFrom(rand, NOSES),
    mouth:       pickFrom(rand, MOUTHS),
    facialHair:  feminineHair ? 'none' : pickWeighted(rand, FACIAL_HAIR, 0.55),
    outfit:      feminineHair && rand() < 0.5 ? 'dress' : pickFrom(rand, OUTFITS.filter(o => o.key !== 'dress')),
    outfitColor: pickFrom(rand, OUTFIT_COLORS),
    neckwear:    pickWeighted(rand, NECKWEAR, 0.35),
    headwear:    pickByWeights(rand, feminineHair
      ? { none: 40, flower: 8, widebrim: 7, feather: 6, beret: 6, fedora: 4, beanie: 6, catears: 5, halo: 4, crown: 3, headphones: 5, bucket: 3, visor: 2, tophat: 1 }
      : { none: 38, fedora: 10, cap: 7, visor: 5, beret: 4, cowboy: 6, beanie: 6, bandana: 5, headphones: 5, bucket: 4, widebrim: 2, tophat: 3, horns: 2, crown: 2, halo: 1 }),
    eyewear:     pickWeighted(rand, EYEWEAR, 0.7),
    detail:      pickWeighted(rand, DETAILS, 0.6),
    gear:        pickWeighted(rand, GEAR, 0.6),
    bg:          pickFrom(rand, BACKGROUNDS),
  }
}

function randomStyled(rand, style) {
  const st = styleOf(style)
  const out = { style: st.key }
  for (const [field, list] of Object.entries(st.fields)) out[field] = pickFrom(rand, list)
  // Ajustes para que salgan combinaciones con sentido
  if (st.key === 'operator') {
    if (out.opFace === 'gasmask' && out.opEyes !== 'none') out.opEyes = 'none'
    if (out.opEyes === 'nvgdown' && !['helmet', 'nvg'].includes(out.opHead)) out.opHead = 'helmet'
    if (out.opHead === 'nvg' && out.opEyes === 'nvgdown') out.opHead = 'helmet'
  }
  return out
}

/** Avatar aleatorio. Con semilla → siempre el mismo para ese texto. style = forzar un estilo */
export function randomAvatar(seed, style) {
  const rand = seed != null ? mulberry32(hashString(String(seed).toLowerCase())) : Math.random
  const st = style ?? pickByWeights(rand, { noir: 50, operator: 11, armor: 10, block: 10, robot: 10, mystic: 9 })
  return st === 'noir' ? randomNoir(rand) : randomStyled(rand, st)
}

/** Limpia un objeto avatar: solo claves y valores válidos del estilo (si algo falla → aleatorio por semilla) */
export function sanitizeAvatar(avatar, seed = 'jugador') {
  if (!avatar || typeof avatar !== 'object') return randomAvatar(seed)
  // Avatares guardados antes de los estilos no traen "style" → clásico
  const style = STYLE_KEYS.includes(avatar.style) ? avatar.style : 'noir'
  const base = randomAvatar(seed, style)
  const out = { ...base }
  for (const [key, list] of Object.entries(styleOf(style).fields)) {
    const val = avatar[key]
    if (typeof val === 'string' && list.some(o => o.key === val)) out[key] = val
  }
  // Los guardados viejos no tenían "gear": que no salga un accesorio sorpresa
  if (style === 'noir' && avatar.gear === undefined) out.gear = 'none'
  return out
}

export const colorOf = (list, key) => (list.find(o => o.key === key) ?? list[0]).color

// ── Utilidades de color ───────────────────────────────────────
function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16))
}
function rgbToHex(rgb) {
  return '#' + rgb.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')
}
export function shade(hex, amount) {
  // amount < 0 oscurece, > 0 aclara (−1..1)
  const rgb = hexToRgb(hex)
  return rgbToHex(rgb.map(v => (amount < 0 ? v * (1 + amount) : v + (255 - v) * amount)))
}
export function isLight(hex) {
  const [r, g, b] = hexToRgb(hex)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
}

// ── Guardado local ────────────────────────────────────────────
const STORAGE_KEY = 'bl_avatar'
export function loadAvatar() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
export function saveAvatar(avatar) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(avatar)) } catch { /* nada */ }
}

// ── Marco según victorias (bronce · plata · oro) ─────────────
export function winTier(wins = 0) {
  if (wins >= 10) return { key: 'gold',   label: 'Crupier de oro',    color: '#e8c35a', ring: 'linear-gradient(135deg,#fff2b0,#c9a84c 40%,#7a5a1a 70%,#f0d77a)' }
  if (wins >= 3)  return { key: 'silver', label: 'Crupier de plata',  color: '#c9ccd2', ring: 'linear-gradient(135deg,#ffffff,#a9aeb6 45%,#5d6168 70%,#dfe2e7)' }
  if (wins >= 1)  return { key: 'bronze', label: 'Crupier de bronce', color: '#c08552', ring: 'linear-gradient(135deg,#f2c39a,#a8683a 45%,#5a3518 70%,#d99a66)' }
  return null
}
