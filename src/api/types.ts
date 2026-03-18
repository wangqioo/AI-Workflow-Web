export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  toolCalls?: ToolCall[]
}

export interface ToolCall {
  name: string
  arguments: string
  result?: string
}

export interface SystemStatus {
  cpu_percent?: number
  memory_percent?: number
  disk_percent?: number
  gpu_temp?: number
  gpu_util?: number
  uptime?: string
}

export interface WorkflowInfo {
  id: string
  name: string
  description: string
  version: string
  author: string
  icon?: string
  installed: boolean
  running: boolean
}

export interface AppInfo {
  id: string
  name: string
  description: string
  icon: string
  port: number
  category: string
  status: 'running' | 'stopped' | 'unknown'
}

export interface TaskInfo {
  id: string
  title: string
  description: string
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected'
  creator_device: string
  assignee_device?: string
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}
