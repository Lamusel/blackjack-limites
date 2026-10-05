import { useEffect, useCallback } from 'react'
import { Howl } from 'howler'
import { useSettings } from './useSettings'

// Mapa de sonidos — las rutas apuntan a client/public/audio/
const SOUND_MAP = {
  music_bg:   { src: ['/audio/casino-bg.mp3'],  loop: true,  volume: 0.35 },
  card_flip:  { src: ['/audio/card-flip.mp3'],  loop: false, volume: 0.7  },
  correct:    { src: ['/audio/correct.mp3'],    loop: false, volume: 0.8  },
  wrong:      { src: ['/audio/wrong.mp3'],      loop: false, volume: 0.8  },
  stand:      { src: ['/audio/chips.mp3'],      loop: false, volume: 0.6  },
  eliminated: { src: ['/audio/eliminated.mp3'], loop: false, volume: 0.8  },
  win:        { src: ['/audio/win.mp3'],        loop: false, volume: 1.0  },
  tick:       { src: ['/audio/tick.mp3'],       loop: false, volume: 0.4  },
  // Reacciones
  whoosh:     { src: ['/audio/whoosh.mp3'],     loop: false, volume: 0.5  },
  splat:      { src: ['/audio/splat.mp3'],      loop: false, volume: 0.7  },
  kiss:       { src: ['/audio/kiss.mp3'],       loop: false, volume: 0.6  },
  bray:       { src: ['/audio/bray.mp3'],       loop: false, volume: 0.55 },
  pop:        { src: ['/audio/pop.mp3'],        loop: false, volume: 0.5  },
  cash:       { src: ['/audio/cash.mp3'],       loop: false, volume: 0.55 },
  slot:       { src: ['/audio/slot.mp3'],       loop: false, volume: 0.55 },
  bang:       { src: ['/audio/bang.mp3'],       loop: false, volume: 0.5  },
  boom:       { src: ['/audio/boom.mp3'],       loop: false, volume: 0.55 },
  splash:     { src: ['/audio/splash.mp3'],     loop: false, volume: 0.6  },
  zap:        { src: ['/audio/zap.mp3'],        loop: false, volume: 0.45 },
  cluck:      { src: ['/audio/cluck.mp3'],      loop: false, volume: 0.6  },
  horn:       { src: ['/audio/horn.mp3'],       loop: false, volume: 0.5  },
  crack:      { src: ['/audio/crack.mp3'],      loop: false, volume: 0.6  },
  sparkle:    { src: ['/audio/sparkle.mp3'],    loop: false, volume: 0.5  },
}

// Instancias compartidas por toda la app (a nivel de módulo)
const howls = {}
let musicId = null

function getHowl(key) {
  if (!SOUND_MAP[key]) return null
  if (!howls[key]) howls[key] = new Howl(SOUND_MAP[key])
  return howls[key]
}

function startMusic() {
  const music = getHowl('music_bg')
  // Evita dos loops encimados si varios componentes usan el hook a la vez
  if (musicId !== null && music.playing(musicId)) return
  if (musicId !== null) music.play(musicId)   // reanuda desde donde se pausó
  else musicId = music.play()
}

function pauseMusic() {
  if (musicId !== null) getHowl('music_bg').pause(musicId)
}

export function useAudio() {
  const { settings } = useSettings()

  // Música de fondo: sigue sonando entre páginas (no se detiene al desmontar).
  // Si el navegador bloquea el autoplay, Howler la arranca en el primer toque.
  useEffect(() => {
    if (settings.music) startMusic()
    else pauseMusic()
  }, [settings.music])

  // Efectos: se respeta settings.sounds sin silenciar la música
  const play = useCallback((key) => {
    if (!settings.sounds || key === 'music_bg') return
    getHowl(key)?.play()
  }, [settings.sounds])

  const stopMusic = useCallback(() => {
    getHowl('music_bg').stop()
    musicId = null
  }, [])

  return { play, stopMusic }
}
