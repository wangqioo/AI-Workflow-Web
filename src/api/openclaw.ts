import { serverConfig } from './config'
import type { ChatMessage } from './types'

export interface NavigationHint {
  route: string
  label: string
}

export interface SendMessageOptions {
  message: string
  sessionId: string
  model?: 'local' | 'server'
  onToken: (token: string) => void
  onToolCall?: (name: string, args: string) => void
  onNavigation?: (hint: NavigationHint) => void
  onDone: () => void
  onError: (error: Error) => void
}

// Map tool call names to web routes
const TOOL_ROUTE_MAP: Record<string, { route: string; label: string }> = {
  execute_workflow: { route: '/workflows', label: '工作流' },
  create_workflow: { route: '/workflows', label: '工作流' },
  manage_workflows: { route: '/workflows', label: '工作流' },
  create_workflow_app: { route: '/workflows', label: '工作流' },
  manage_ocw_apps: { route: '/workflows', label: '工作流' },
  list_builtin_workflows: { route: '/workflows', label: '工作流' },
  get_system_status: { route: '/', label: '仪表盘' },
  system_monitor: { route: '/', label: '仪表盘' },
  manage_tasks: { route: '/tasks', label: '任务管理' },
  create_task: { route: '/tasks', label: '任务管理' },
  browse_tasks: { route: '/tasks', label: '任务管理' },
  knowledge_search: { route: '/apps', label: '知识库' },
  rag_search: { route: '/apps', label: '知识库' },
  voice_transcription: { route: '/apps', label: '语音识别' },
  translate_text: { route: '/apps', label: '翻译' },
  tts_speak: { route: '/apps', label: '语音合成' },
  email_manager: { route: '/apps', label: '邮件管理' },
  smart_home_control: { route: '/apps', label: '智能家居' },
  vlm_analyze_image: { route: '/apps', label: '图像理解' },
  camera_capture: { route: '/apps', label: '摄像头' },
  file_transfer: { route: '/apps', label: '文件传输' },
  doc_list_projects: { route: '/apps', label: '文档版本' },
}

export function sendMessage(options: SendMessageOptions): AbortController {
  const controller = new AbortController()
  const detectedTools: string[] = []

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
              // After AI fully responds, check for navigation
              _emitNavigation(detectedTools, options.onNavigation)
              options.onDone()
              return
            }
            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'token') {
                options.onToken(parsed.content)
              } else if (parsed.type === 'tool_call') {
                detectedTools.push(parsed.name)
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
      _emitNavigation(detectedTools, options.onNavigation)
      options.onDone()
    })
    .catch((err) => {
      if (err.name !== 'AbortError') options.onError(err)
    })

  return controller
}

function _emitNavigation(
  tools: string[],
  onNavigation?: (hint: NavigationHint) => void,
) {
  if (!onNavigation || tools.length === 0) return
  // Find the first tool that maps to a route (priority: last tool called)
  for (let i = tools.length - 1; i >= 0; i--) {
    const mapping = TOOL_ROUTE_MAP[tools[i]]
    if (mapping) {
      // Delay slightly so user can read the response first
      setTimeout(() => onNavigation(mapping), 1200)
      return
    }
  }
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
