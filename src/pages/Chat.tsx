import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, History, Trash2, ArrowRight } from 'lucide-react'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { ChatInput } from '@/components/chat/ChatInput'
import { sendMessage } from '@/api/openclaw'
import type { NavigationHint } from '@/api/openclaw'
import type { ChatMessage as Message, Session } from '@/api/types'
import { useSettings } from '@/hooks/useSettings'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function Chat() {
  const navigate = useNavigate()
  const settings = useSettings()
  const [navHint, setNavHint] = useState<NavigationHint | null>(null)
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [sessions, setSessions] = useState<Session[]>(() => {
    const stored = localStorage.getItem('chat-sessions')
    return stored ? JSON.parse(stored) : []
  })
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    const stored = localStorage.getItem('active-session')
    return stored || null
  })
  const [isStreaming, setIsStreaming] = useState(false)
  const [model, setModel] = useState<'local' | 'server'>(settings.model)
  const [showHistory, setShowHistory] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeSession = sessions.find((s) => s.id === activeSessionId)
  const messages = activeSession?.messages || []

  // Persist sessions
  useEffect(() => {
    localStorage.setItem('chat-sessions', JSON.stringify(sessions))
  }, [sessions])

  useEffect(() => {
    if (activeSessionId) localStorage.setItem('active-session', activeSessionId)
  }, [activeSessionId])

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const createSession = useCallback(() => {
    const session: Session = {
      id: generateId(),
      title: '新对话',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setSessions((prev) => [session, ...prev])
    setActiveSessionId(session.id)
    setShowHistory(false)
    return session.id
  }, [])

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
    setActiveSessionId((current) => (current === id ? null : current))
  }, [])

  const updateMessages = useCallback(
    (sessionId: string, updater: (msgs: Message[]) => Message[]) => {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s
          const newMessages = updater(s.messages)
          const title =
            s.title === '新对话' && newMessages.length > 0
              ? newMessages[0].content.slice(0, 30) + (newMessages[0].content.length > 30 ? '...' : '')
              : s.title
          return { ...s, messages: newMessages, title, updatedAt: Date.now() }
        })
      )
    },
    []
  )

  function handleSend(text: string) {
    let sessionId = activeSessionId
    if (!sessionId) {
      sessionId = createSession()
    }

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }
    const assistantMsg: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    }

    updateMessages(sessionId, (msgs) => [...msgs, userMsg, assistantMsg])
    setIsStreaming(true)

    const sid = sessionId
    const aid = assistantMsg.id
    abortRef.current = sendMessage({
      message: text,
      sessionId: sid,
      model,
      onToken(token) {
        updateMessages(sid, (msgs) =>
          msgs.map((m) => (m.id === aid ? { ...m, content: m.content + token } : m))
        )
      },
      onToolCall(name, args) {
        updateMessages(sid, (msgs) =>
          msgs.map((m) =>
            m.id === aid
              ? { ...m, toolCalls: [...(m.toolCalls || []), { name, arguments: args }] }
              : m
          )
        )
      },
      onNavigation(hint) {
        if (navTimerRef.current) clearTimeout(navTimerRef.current)
        setNavHint(hint)
        navTimerRef.current = setTimeout(() => setNavHint(null), 8000)
      },
      onDone() {
        setIsStreaming(false)
        abortRef.current = null
      },
      onError(error) {
        updateMessages(sid, (msgs) =>
          msgs.map((m) =>
            m.id === aid
              ? { ...m, content: m.content || `[Error] ${error.message}` }
              : m
          )
        )
        setIsStreaming(false)
        abortRef.current = null
      },
    })
  }

  function handleStop() {
    abortRef.current?.abort()
    setIsStreaming(false)
  }

  return (
    <div className="flex h-full">
      {/* History Panel */}
      {showHistory && (
        <div className="w-64 border-r border-border bg-bg-primary flex flex-col shrink-0">
          <div className="p-3 border-b border-border">
            <button
              onClick={createSession}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent-light transition-colors"
            >
              <Plus size={14} />
              新建对话
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sessions.map((s) => (
              <div
                key={s.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                  s.id === activeSessionId
                    ? 'bg-accent-dim text-accent-light'
                    : 'text-text-secondary hover:bg-bg-hover'
                }`}
                onClick={() => {
                  setActiveSessionId(s.id)
                  setShowHistory(false)
                }}
              >
                <span className="flex-1 truncate">{s.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteSession(s.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-error transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="text-text-muted text-xs text-center py-8">暂无历史对话</p>
            )}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
              showHistory
                ? 'bg-accent-dim text-accent-light'
                : 'text-text-secondary hover:bg-bg-hover'
            }`}
          >
            <History size={14} />
            历史
          </button>
          <button
            onClick={createSession}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-text-secondary hover:bg-bg-hover transition-colors"
          >
            <Plus size={14} />
            新对话
          </button>
          {activeSession && (
            <span className="ml-auto text-xs text-text-muted truncate max-w-xs">
              {activeSession.title}
            </span>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-accent-dim flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-accent-light">OC</span>
              </div>
              <h2 className="text-lg font-medium text-text-primary mb-2">OpenClaw AI</h2>
              <p className="text-sm text-text-secondary max-w-md">
                你的本地 AI 助手。支持智能对话、工具调用、文件分析、工作流编排等功能。
              </p>
              <div className="grid grid-cols-2 gap-3 mt-6 max-w-sm">
                {['帮我分析系统状态', '创建一个新的工作流', '翻译这段文字', '搜索知识库'].map(
                  (prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSend(prompt)}
                      className="px-4 py-2.5 text-xs text-text-secondary bg-bg-tertiary border border-border rounded-lg hover:border-border-light hover:text-text-primary transition-colors text-left"
                    >
                      {prompt}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : (
            <div>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {navHint && (
          <div className="mx-4 mb-2 flex items-center gap-3 px-4 py-2.5 rounded-lg bg-accent-dim border border-accent/30 animate-in slide-in-from-bottom-2">
            <span className="text-sm text-accent-light flex-1">
              跳转到 <strong>{navHint.label}</strong>？
            </span>
            <button
              onClick={() => {
                setNavHint(null)
                if (navTimerRef.current) clearTimeout(navTimerRef.current)
                navigate(navHint.route)
              }}
              className="flex items-center gap-1 px-3 py-1 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent-light transition-colors"
            >
              前往 <ArrowRight size={12} />
            </button>
            <button
              onClick={() => {
                setNavHint(null)
                if (navTimerRef.current) clearTimeout(navTimerRef.current)
              }}
              className="text-text-muted hover:text-text-secondary text-xs"
            >
              忽略
            </button>
          </div>
        )}

        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          isStreaming={isStreaming}
          model={model}
          onModelChange={setModel}
        />
      </div>
    </div>
  )
}
