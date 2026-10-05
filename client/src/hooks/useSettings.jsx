import { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext(null)

const DEFAULTS = {
  music:    true,
  sounds:   true,
  language: 'es',  // 'es' | 'en'
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('bl_settings')
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS
    } catch {
      return DEFAULTS
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('bl_settings', JSON.stringify(settings))
    } catch {}
  }, [settings])

  const update = (key, value) =>
    setSettings(prev => ({ ...prev, [key]: value }))

  const toggle = (key) =>
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <SettingsContext.Provider value={{ settings, update, toggle }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings debe usarse dentro de SettingsProvider')
  return ctx
}
