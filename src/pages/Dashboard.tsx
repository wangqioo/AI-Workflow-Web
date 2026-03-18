import { useEffect, useState } from 'react'
import {
  Cpu,
  HardDrive,
  MemoryStick,
  Thermometer,
  Activity,
  Wifi,
  WifiOff,
  Server,
  Clock,
} from 'lucide-react'
import { Card } from '@/components/common/Card'
import { gateway } from '@/api/gateway'
import { healthCheck as openclawHealth } from '@/api/openclaw'
import type { SystemStatus } from '@/api/types'

export function Dashboard() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [gatewayOk, setGatewayOk] = useState(false)
  const [openclawOk, setOpenclawOk] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      const [gOk, oOk] = await Promise.all([
        gateway.healthCheck(),
        openclawHealth(),
      ])
      setGatewayOk(gOk)
      setOpenclawOk(oOk)

      if (gOk) {
        try {
          const s = await gateway.getStatus()
          setStatus(s)
        } catch { /* ignore */ }
      }
      setLoading(false)
    }
    fetchAll()
    const timer = setInterval(fetchAll, 10000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ConnectionCard
          name="Engine Gateway"
          description="后端服务网关 (Port 8100)"
          connected={gatewayOk}
          loading={loading}
        />
        <ConnectionCard
          name="OpenClaw Gateway"
          description="AI 交互网关 (Port 18789)"
          connected={openclawOk}
          loading={loading}
        />
      </div>

      {/* System Metrics */}
      <h2 className="text-sm font-medium text-text-secondary">系统资源</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={Cpu}
          label="CPU"
          value={status?.cpu_percent}
          unit="%"
          color="accent"
        />
        <MetricCard
          icon={MemoryStick}
          label="内存"
          value={status?.memory_percent}
          unit="%"
          color="accent"
        />
        <MetricCard
          icon={HardDrive}
          label="磁盘"
          value={status?.disk_percent}
          unit="%"
          color="warning"
        />
        <MetricCard
          icon={Thermometer}
          label="GPU 温度"
          value={status?.gpu_temp}
          unit="C"
          color="error"
        />
      </div>

      {/* Quick Info */}
      <h2 className="text-sm font-medium text-text-secondary">系统信息</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-dim flex items-center justify-center">
              <Server size={18} className="text-accent-light" />
            </div>
            <div>
              <p className="text-xs text-text-muted">平台</p>
              <p className="text-sm text-text-primary">NVIDIA Jetson Orin</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-dim flex items-center justify-center">
              <Activity size={18} className="text-accent-light" />
            </div>
            <div>
              <p className="text-xs text-text-muted">GPU 利用率</p>
              <p className="text-sm text-text-primary">
                {status?.gpu_util != null ? `${status.gpu_util}%` : '--'}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-dim flex items-center justify-center">
              <Clock size={18} className="text-accent-light" />
            </div>
            <div>
              <p className="text-xs text-text-muted">运行时间</p>
              <p className="text-sm text-text-primary">{status?.uptime || '--'}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function ConnectionCard({
  name,
  description,
  connected,
  loading,
}: {
  name: string
  description: string
  connected: boolean
  loading: boolean
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              connected ? 'bg-success/15' : 'bg-error/15'
            }`}
          >
            {connected ? (
              <Wifi size={18} className="text-success" />
            ) : (
              <WifiOff size={18} className="text-error" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">{name}</p>
            <p className="text-xs text-text-muted">{description}</p>
          </div>
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full ${
            loading
              ? 'bg-text-muted/15 text-text-muted'
              : connected
                ? 'bg-success/15 text-success'
                : 'bg-error/15 text-error'
          }`}
        >
          {loading ? '检测中...' : connected ? '已连接' : '未连接'}
        </span>
      </div>
    </Card>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: React.ElementType
  label: string
  value?: number
  unit: string
  color: string
}) {
  const displayValue = value != null ? value : '--'
  const percent = typeof value === 'number' ? Math.min(value, 100) : 0

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} className="text-text-muted" />
        <span className="text-xs text-text-muted">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-text-primary mb-2">
        {displayValue}
        <span className="text-sm text-text-muted ml-1">{unit}</span>
      </div>
      <div className="w-full h-1.5 bg-bg-primary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            percent > 80 ? 'bg-error' : percent > 60 ? 'bg-warning' : 'bg-accent'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </Card>
  )
}
