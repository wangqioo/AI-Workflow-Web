const DEFAULT_HOST = window.location.hostname || 'localhost'

export interface ServerConfig {
  engineGateway: string
  openclawGateway: string
}

const stored = localStorage.getItem('server-config')
const parsed = stored ? JSON.parse(stored) : null

export const serverConfig: ServerConfig = {
  engineGateway: parsed?.engineGateway || `http://${DEFAULT_HOST}:8100`,
  openclawGateway: parsed?.openclawGateway || `http://${DEFAULT_HOST}:18789`,
}

export function updateServerConfig(config: Partial<ServerConfig>) {
  Object.assign(serverConfig, config)
  localStorage.setItem('server-config', JSON.stringify(serverConfig))
}
