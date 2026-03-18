import { useState } from 'react'
import {
  Play,
  Download,
  Search,
  FileText,
  Languages,
  ScanText,
  FolderOpen,
  Radio,
  Package,
} from 'lucide-react'
import { Card } from '@/components/common/Card'
import { StatusBadge } from '@/components/common/StatusBadge'

interface WorkflowItem {
  id: string
  name: string
  description: string
  icon: React.ElementType
  port: number
  category: string
  installed: boolean
  running: boolean
}

const builtinWorkflows: WorkflowItem[] = [
  {
    id: 'invoice',
    name: '发票识别',
    description: '自动识别和提取发票信息，支持增值税发票和电子发票',
    icon: FileText,
    port: 8123,
    category: '文档处理',
    installed: true,
    running: false,
  },
  {
    id: 'translator',
    name: '实时翻译',
    description: '多语言实时翻译，支持语音输入和文字翻译',
    icon: Languages,
    port: 8124,
    category: 'AI 工具',
    installed: true,
    running: false,
  },
  {
    id: 'screen-ocr',
    name: '屏幕内容识别',
    description: '截取屏幕区域并进行 OCR 文字识别',
    icon: ScanText,
    port: 8122,
    category: '文档处理',
    installed: true,
    running: false,
  },
  {
    id: 'file-organizer',
    name: '智能文件整理',
    description: 'AI 驱动的文件自动分类和整理工具',
    icon: FolderOpen,
    port: 8121,
    category: '效率工具',
    installed: true,
    running: false,
  },
  {
    id: 'sensor-automation',
    name: '传感器自动化',
    description: '基于传感器事件的自动化触发和执行',
    icon: Radio,
    port: 8125,
    category: '自动化',
    installed: true,
    running: false,
  },
]

export function Workflows() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const categories = ['all', ...new Set(builtinWorkflows.map((w) => w.category))]
  const filtered = builtinWorkflows.filter(
    (w) =>
      (filter === 'all' || w.category === filter) &&
      (w.name.includes(search) || w.description.includes(search))
  )

  return (
    <div className="p-6 space-y-5">
      {/* Search & Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索工作流..."
            className="w-full bg-bg-tertiary border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50"
          />
        </div>
        <div className="flex gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                filter === cat
                  ? 'bg-accent-dim text-accent-light'
                  : 'text-text-secondary hover:bg-bg-hover'
              }`}
            >
              {cat === 'all' ? '全部' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Workflow Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((wf) => (
          <WorkflowCard key={wf.id} workflow={wf} />
        ))}
      </div>

      {/* Install from Store */}
      <Card className="border-dashed">
        <div className="flex items-center gap-3 text-center justify-center py-4">
          <Package size={20} className="text-text-muted" />
          <div>
            <p className="text-sm text-text-secondary">
              从工作流商店安装更多工作流
            </p>
            <p className="text-xs text-text-muted mt-1">
              工作流商店运行在 Engine Gateway 的 /workflows/store 端点
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function WorkflowCard({ workflow }: { workflow: WorkflowItem }) {
  const Icon = workflow.icon

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-dim flex items-center justify-center shrink-0">
            <Icon size={18} className="text-accent-light" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-text-primary">{workflow.name}</h3>
            <p className="text-xs text-text-muted">{workflow.category}</p>
          </div>
        </div>
        <StatusBadge status={workflow.running ? 'running' : workflow.installed ? 'stopped' : 'offline'} />
      </div>
      <p className="text-xs text-text-secondary leading-relaxed">{workflow.description}</p>
      <div className="flex items-center gap-2 mt-auto pt-2">
        {workflow.installed ? (
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs hover:bg-accent-light transition-colors">
            <Play size={12} />
            运行
          </button>
        ) : (
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-tertiary text-text-secondary text-xs hover:bg-bg-hover transition-colors">
            <Download size={12} />
            安装
          </button>
        )}
        <span className="ml-auto text-xs text-text-muted font-mono">:{workflow.port}</span>
      </div>
    </Card>
  )
}
