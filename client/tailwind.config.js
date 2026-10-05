/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Fondos
        'noir-900':  '#0e0c0a',   // fondo principal
        'noir-800':  '#141210',   // fondo secundario
        'noir-700':  '#1c1916',   // superficies (cartas, paneles)
        'noir-600':  '#2e2a25',   // bordes y separadores
        'noir-500':  '#3d3830',   // bordes hover
        // Dorado mate (acento principal)
        'gold-400':  '#e8d5a3',   // texto destacado / dorado suave
        'gold-500':  '#c9a84c',   // acento principal
        'gold-600':  '#a07a28',   // dorado oscuro / hover
        // Textos
        'cream':     '#f0e6d3',   // texto principal
        'warm-400':  '#a09688',   // texto secundario
        'warm-600':  '#6b6560',   // texto muted
        // Estados
        'win':       '#2d5a3d',   // acierto (verde sobrio)
        'win-text':  '#7ecf9e',   // texto sobre acierto
        'lose':      '#7a2828',   // fallo (rojo sobrio)
        'lose-text': '#cf7e7e',   // texto sobre fallo
        'stand':     '#4a3d1a',   // plantarse (ámbar oscuro)
        'stand-text':'#cfb07e',   // texto sobre plantarse
      },
      fontFamily: {
        serif:  ['Playfair Display', 'Georgia', 'serif'],
        sans:   ['DM Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs':   ['11px', { lineHeight: '1.5' }],
        'sm':   ['13px', { lineHeight: '1.5' }],
        'base': ['15px', { lineHeight: '1.6' }],
        'lg':   ['18px', { lineHeight: '1.4' }],
        'xl':   ['22px', { lineHeight: '1.3' }],
        '2xl':  ['28px', { lineHeight: '1.2' }],
        '3xl':  ['36px', { lineHeight: '1.1' }],
        '4xl':  ['48px', { lineHeight: '1.0' }],
      },
      borderRadius: {
        'card': '16px',
        'btn':  '10px',
        'pill': '999px',
      },
      boxShadow: {
        'card':   '0 2px 12px rgba(0,0,0,0.5)',
        'glow-gold': '0 0 20px rgba(201,168,76,0.15)',
      },
      animation: {
        'flip-in':    'flipIn 0.4s ease forwards',
        'float-up':   'floatUp 0.6s ease forwards',
        'pulse-gold': 'pulseGold 1.5s ease infinite',
        'fade-in':    'fadeIn 0.3s ease forwards',
      },
      keyframes: {
        flipIn: {
          '0%':   { transform: 'rotateY(90deg)', opacity: '0' },
          '100%': { transform: 'rotateY(0deg)',  opacity: '1' },
        },
        floatUp: {
          '0%':   { transform: 'translateY(0)',    opacity: '1' },
          '100%': { transform: 'translateY(-40px)', opacity: '0' },
        },
        pulseGold: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
