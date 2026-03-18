import { serverConfig } from './config'
import type { ChatMessage } from './types'

export interface SendMessageOptions {
  message: string
  sessionId: string
  model?: 'local' | 'server'
  onToken: (token: string) => void
  onToolCall?: (name: string, args: string) => void
  onDone: () => void
  onError: (error: Error) => void
}

export function sendMessage(options: SendMessageOptions): AbortController {
  const controller = new AbortController()

  const url = `${serverConfig.openclawGateway}/chat`
  const body = JSON.stringify({
    message: options.message,
    session_id: options.sessionId,
    model: options.model || 'server',
  })

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body,
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`OpenClaw Error: ${res.status}`)
      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              options.onDone()
              return
            }
            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'token') {
                options.onToken(parsed.content)
              } else if (parsed.type === 'tool_call') {
                options.onToolCall?.(parsed.name, parsed.arguments)
              } else if (parsed.content) {
                options.onToken(parsed.content)
              }
            } catch {
              options.onToken(data)
            }
          }
        }
      }
      options.onDone()
    })
    .catch((err) => {
      if (err.name !== 'AbortError') options.onError(err)
    })

  return controller
}

export async function getSessions(): Promise<{ id: string; title: string }[]> {
  try {
    const res = await fetch(`${serverConfig.openclawGateway}/sessions`)
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function getSessionHistory(sessionId: string): Promise<ChatMessage[]> {
  try {
    const res = await fetch(`${serverConfig.openclawGateway}/sessions/${sessionId}/history`)
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    await fetch(`${serverConfig.openclawGateway}/health`, { signal: AbortSignal.timeout(3000) })
    return true
  } catch {
    return false
  }
}
