import { Bot, User } from 'lucide-react'
import type { ChatMessage as Message } from '@/api/types'

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 px-6 py-4 ${isUser ? '' : 'bg-bg-secondary/50'}`}>
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isUser ? 'bg-accent-dim text-accent-light' : 'bg-bg-tertiary text-text-secondary'
        }`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-text-muted mb-1.5">
          {isUser ? '你' : 'OpenClaw'}
        </div>
        <div className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
          {message.role === 'assistant' && !message.content && (
            <span className="inline-flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.3s]" />
            </span>
          )}
        </div>
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.toolCalls.map((tc, i) => (
              <div key={i} className="text-xs bg-bg-tertiary rounded-lg px-3 py-2 text-text-muted">
                <span className="text-accent-light font-mono">{tc.name}</span>
                {tc.result && (
                  <div className="mt-1 text-text-secondary">{tc.result}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
