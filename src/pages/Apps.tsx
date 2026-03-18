import { useState } from 'react'
import {
  MessageSquare,
  FileText,
  Languages,
  Mic,
  Camera,
  Folder,
  Globe,
  Mail,
  Home,
  Monitor,
  Power,
  Brain,
  Search,
  BookOpen,
  PenTool,
  ScanText,
  Volume2,
  GitBranch,
  Radio,
} from 'lucide-react'
import { Card } from '@/components/common/Card'

interface AppItem {
  id: string
  name: string
  description: string
  icon: React.ElementType
  port: number
  category: string
}

const apps: AppItem[] = [
  { id: 'chat', name: 'AI 对话', description: '与 OpenClaw 对话', icon: MessageSquare, port: 18789, category: 'AI' },
  { id: 'doc-parser', name: '文档解析', description: 'OCR + AI 文档分析', icon: FileText, port: 8083, category: 'AI' },
  { id: 'translate', name: '翻译', description: '多语言 AI 翻译', icon: Languages, port: 8089, category: 'AI' },
  { id: 'tts', name: '语音合成', description: '文字转语音', icon: Volume2, port: 8088, category: 'AI' },
  { id: 'asr', name: '语音识别', description: '语音转文字 (Whisper)', icon: Mic, port: 8082, category: 'AI' },
  { id: 'knowledge', name: '知识库', description: 'RAG 语义检索', icon: BookOpen, port: 8090, category: 'AI' },
  { id: 'memory', name: '记忆系统', description: 'Mnemosyne 四层记忆引擎', icon: Brain, port: 8091, category: 'AI' },
  { id: 'vlm', name: '图像理解', description: 'VLM 多模态分析', icon: ScanText, port: 8094, category: 'AI' },
  { id: 'camera', name: '摄像头', description: 'USB 摄像头 MJPEG', icon: Camera, port: 8112, category: '硬件' },
  { id: 'sensor', name: '传感器', description: '环境传感数据', icon: Radio, port: 8113, category: '硬件' },
  { id: 'file-transfer', name: '文件传输', description: '局域网文件共享', icon: Folder, port: 8084, category: '工具' },
  { id: 'browser', name: '浏览器助手', description: 'Web 自动化', icon: Globe, port: 8093, category: '工具' },
  { id: 'email', name: '邮件管理', description: '智能邮件摘要', icon: Mail, port: 8092, category: '工具' },
  { id: 'smart-home', name: '智能家居', description: 'Home Assistant 控制', icon: Home, port: 8096, category: '工具' },
  { id: 'monitor', name: '系统监控', description: 'CPU/GPU/内存监控', icon: Monitor, port: 8085, category: '系统' },
  { id: 'wol', name: '远程唤醒', description: 'Wake-on-LAN', icon: Power, port: 8086, category: '系统' },
  { id: 'crawl', name: '网页抓取', description: '内容提取', icon: Search, port: 8092, category: '工具' },
  { id: 'doc-version', name: '文档版本', description: 'Git 文档版本管理', icon: GitBranch, port: 8097, category: '工具' },
  { id: 'notes', name: '笔记', description: 'AI 增强笔记', icon: PenTool, port: 8097, category: '工具' },
]

export function Apps() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const categories = ['all', ...new Set(apps.map((a) => a.category))]
  const filtered = apps.filter(
    (a) =>
      (filter === 'all' || a.category === filter) &&
      (a.name.includes(search) || a.description.includes(search))
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
            placeholder="搜索应用..."
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

      {/* App Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  )
}

function AppCard({ app }: { app: AppItem }) {
  const Icon = app.icon

  return (
    <Card className="flex flex-col items-center text-center gap-2 py-5 hover:border-accent/30">
      <div className="w-12 h-12 rounded-xl bg-accent-dim flex items-center justify-center">
        <Icon size={22} className="text-accent-light" />
      </div>
      <h3 className="text-sm font-medium text-text-primary">{app.name}</h3>
      <p className="text-xs text-text-muted leading-tight">{app.description}</p>
      <span className="text-xs text-text-muted font-mono mt-auto">:{app.port}</span>
    </Card>
  )
}
