interface StatusBadgeProps {
  status: 'online' | 'offline' | 'warning' | 'running' | 'stopped'
  label?: string
}

const statusStyles = {
  online: 'bg-success/15 text-success',
  running: 'bg-success/15 text-success',
  offline: 'bg-error/15 text-error',
  stopped: 'bg-text-muted/15 text-text-muted',
  warning: 'bg-warning/15 text-warning',
}

const statusLabels = {
  online: '在线',
  running: '运行中',
  offline: '离线',
  stopped: '已停止',
  warning: '警告',
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label || statusLabels[status]}
    </span>
  )
}
