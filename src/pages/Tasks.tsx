import { useState } from 'react'
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  PlayCircle,
  Send,
} from 'lucide-react'
import { Card } from '@/components/common/Card'

interface TaskItem {
  id: string
  title: string
  description: string
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected'
  creator: string
  assignee: string
  createdAt: string
}

const demoTasks: TaskItem[] = [
  {
    id: '1',
    title: '数据备份任务',
    description: '将文档目录备份到外部存储设备',
    status: 'completed',
    creator: 'Orin-Main',
    assignee: 'DGX-Spark',
    createdAt: '2025-01-15 14:30',
  },
  {
    id: '2',
    title: '模型更新检查',
    description: '检查 Qwen 模型是否有新版本可用',
    status: 'in_progress',
    creator: 'Orin-Main',
    assignee: 'DGX-Spark',
    createdAt: '2025-01-15 15:00',
  },
  {
    id: '3',
    title: '传感器数据分析',
    description: '分析过去 24 小时的环境传感器数据并生成报告',
    status: 'pending',
    creator: 'Orin-Main',
    assignee: '',
    createdAt: '2025-01-15 16:00',
  },
]

const statusConfig = {
  pending: { icon: Clock, label: '待处理', color: 'text-text-muted', bg: 'bg-text-muted/15' },
  accepted: { icon: CheckCircle2, label: '已接受', color: 'text-accent-light', bg: 'bg-accent-dim' },
  in_progress: { icon: PlayCircle, label: '进行中', color: 'text-warning', bg: 'bg-warning/15' },
  completed: { icon: CheckCircle2, label: '已完成', color: 'text-success', bg: 'bg-success/15' },
  rejected: { icon: XCircle, label: '已拒绝', color: 'text-error', bg: 'bg-error/15' },
}

export function Tasks() {
  const [tasks] = useState(demoTasks)
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState<string>('all')

  const statuses = ['all', 'pending', 'in_progress', 'completed', 'rejected']
  const filtered =
    filter === 'all' ? tasks : tasks.filter((t) => t.status === filter)

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                filter === s
                  ? 'bg-accent-dim text-accent-light'
                  : 'text-text-secondary hover:bg-bg-hover'
              }`}
            >
              {s === 'all'
                ? '全部'
                : statusConfig[s as keyof typeof statusConfig]?.label || s}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-white text-xs hover:bg-accent-light transition-colors"
        >
          <Plus size={14} />
          创建任务
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="任务标题"
              className="w-full bg-bg-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50"
            />
            <textarea
              placeholder="任务描述..."
              rows={3}
              className="w-full bg-bg-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 resize-none"
            />
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="指派设备 (可选)"
                className="flex-1 bg-bg-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50"
              />
              <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-accent text-white text-sm hover:bg-accent-light transition-colors">
                <Send size={14} />
                发送
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {filtered.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle size={24} className="text-text-muted mx-auto mb-3" />
            <p className="text-sm text-text-muted">暂无任务</p>
          </div>
        )}
      </div>

      {/* Info */}
      <p className="text-xs text-text-muted text-center">
        跨设备任务通过 Cloud Relay 传递, 使用 RSA-2048 签名确保安全
      </p>
    </div>
  )
}

function TaskCard({ task }: { task: TaskItem }) {
  const cfg = statusConfig[task.status]
  const Icon = cfg.icon

  return (
    <Card>
      <div className="flex items-start gap-4">
        <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
          <Icon size={16} className={cfg.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium text-text-primary">{task.title}</h3>
            <span className={`text-xs px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">{task.description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
            <span>创建: {task.creator}</span>
            {task.assignee && <span>指派: {task.assignee}</span>}
            <span className="ml-auto">{task.createdAt}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
