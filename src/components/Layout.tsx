import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

const pageTitles: Record<string, string> = {
  '/': '仪表盘',
  '/chat': 'AI 对话',
  '/workflows': '工作流',
  '/apps': '应用中心',
  '/tasks': '任务管理',
  '/settings': '设置',
}

export function Layout() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'AI Workflow'

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header title={title} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
