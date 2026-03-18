import { useState, useEffect } from 'react'
import { getSettings, subscribeSettings, type Settings } from '@/store/settings'

export function useSettings(): Settings {
  const [settings, setSettings] = useState(getSettings)

  useEffect(() => {
    return subscribeSettings(() => setSettings(getSettings()))
  }, [])

  return settings
}
