import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { Send, Square, Cpu, Server } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  onStop: () => void
  isStreaming: boolean
  model: 'local' | 'server'
  onModelChange: (model: 'local' | 'server') => void
}

export function ChatInput({ onSend, onStop, isStreaming, model, onModelChange }: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px'
    }
  }, [input])

  function handleSubmit() {
    const text = input.trim()
    if (!text || isStreaming) return
    onSend(text)
    setInput('')
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-border bg-bg-secondary p-4">
      <div className="flex items-end gap-3 max-w-3xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
            rows={1}
            className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-3 pr-12 text-sm text-text-primary placeholder-text-muted resize-none focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>

        {/* Model Toggle */}
        <button
          onClick={() => onModelChange(model === 'local' ? 'server' : 'local')}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs transition-colors border ${
            model === 'server'
              ? 'border-accent/30 bg-accent-dim text-accent-light'
              : 'border-border bg-bg-tertiary text-text-secondary'
          }`}
          title={model === 'server' ? '服务端模型 (35B)' : '本地模型 (4B)'}
        >
          {model === 'server' ? <Server size={14} /> : <Cpu size={14} />}
          <span>{model === 'server' ? '35B' : '4B'}</span>
        </button>

        {/* Send / Stop */}
        {isStreaming ? (
          <button
            onClick={onStop}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-error/15 text-error hover:bg-error/25 transition-colors"
          >
            <Square size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent text-white hover:bg-accent-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
