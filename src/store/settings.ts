import { serverConfig, updateServerConfig } from '@/api/config'

export interface Settings {
  engineGateway: string
  openclawGateway: string
  model: 'local' | 'server'
  language: 'zh' | 'en'
  theme: 'dark'
}

const STORAGE_KEY = 'app-settings'

function loadSettings(): Settings {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch { /* ignore */ }
  }
  return {
    engineGateway: serverConfig.engineGateway,
    openclawGateway: serverConfig.openclawGateway,
    model: 'server',
    language: 'zh',
    theme: 'dark',
  }
}

let _settings = loadSettings()
const _listeners = new Set<() => void>()

export function getSettings(): Settings {
  return _settings
}

export function saveSettings(updates: Partial<Settings>) {
  _settings = { ..._settings, ...updates }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(_settings))

  if (updates.engineGateway || updates.openclawGateway) {
    updateServerConfig({
      engineGateway: _settings.engineGateway,
      openclawGateway: _settings.openclawGateway,
    })
  }

  _listeners.forEach((fn) => fn())
}

export function subscribeSettings(fn: () => void) {
  _listeners.add(fn)
  return () => { _listeners.delete(fn) }
}
