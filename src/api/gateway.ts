import { serverConfig } from './config'
import type { SystemStatus, WorkflowInfo, AppInfo, TaskInfo } from './types'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${serverConfig.engineGateway}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`)
  return res.json()
}

export const gateway = {
  async getStatus(): Promise<SystemStatus> {
    return request('/system/status')
  },

  async getServices(): Promise<AppInfo[]> {
    return request('/services')
  },

  async getWorkflows(): Promise<WorkflowInfo[]> {
    return request('/workflows')
  },

  async installWorkflow(id: string): Promise<void> {
    await request(`/workflows/${id}/install`, { method: 'POST' })
  },

  async runWorkflow(id: string, params?: Record<string, unknown>): Promise<unknown> {
    return request(`/workflows/${id}/run`, {
      method: 'POST',
      body: JSON.stringify(params || {}),
    })
  },

  async getTasks(): Promise<TaskInfo[]> {
    return request('/task_agent/tasks')
  },

  async createTask(task: Partial<TaskInfo>): Promise<TaskInfo> {
    return request('/task_agent/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    })
  },

  async healthCheck(): Promise<boolean> {
    try {
      await fetch(`${serverConfig.engineGateway}/health`, { signal: AbortSignal.timeout(3000) })
      return true
    } catch {
      return false
    }
  },
}
