import { NavLink } from 'react-router-dom'
import {
  MessageSquare,
  LayoutDashboard,
  Workflow,
  Grid3X3,
  ClipboardList,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '仪表盘', labelEn: 'Dashboard' },
  { to: '/chat', icon: MessageSquare, label: 'AI 对话', labelEn: 'Chat' },
  { to: '/workflows', icon: Workflow, label: '工作流', labelEn: 'Workflows' },
  { to: '/apps', icon: Grid3X3, label: '应用', labelEn: 'Apps' },
  { to: '/tasks', icon: ClipboardList, label: '任务', labelEn: 'Tasks' },
  { to: '/settings', icon: Settings, label: '设置', labelEn: 'Settings' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`flex flex-col h-screen bg-bg-secondary border-r border-border transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm shrink-0">
          OC
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
            OpenClaw Web
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-accent-dim text-accent-light'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-border text-text-muted hover:text-text-primary transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  )
}
