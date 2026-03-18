import { useEffect, useState } from 'react'
import { Circle, Wifi, WifiOff } from 'lucide-react'
import { gateway } from '@/api/gateway'
import { healthCheck as openclawHealth } from '@/api/openclaw'

export function Header({ title }: { title: string }) {
  const [gatewayOk, setGatewayOk] = useState(false)
  const [openclawOk, setOpenclawOk] = useState(false)

  useEffect(() => {
    const check = () => {
      gateway.healthCheck().then(setGatewayOk)
      openclawHealth().then(setOpenclawOk)
    }
    check()
    const timer = setInterval(check, 15000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="flex items-center justify-between h-14 px-6 border-b border-border bg-bg-secondary shrink-0">
      <h1 className="text-base font-medium text-text-primary">{title}</h1>
      <div className="flex items-center gap-4">
        <StatusDot label="Gateway" ok={gatewayOk} />
        <StatusDot label="OpenClaw" ok={openclawOk} />
      </div>
    </header>
  )
}

function StatusDot({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
      {ok ? (
        <Wifi size={13} className="text-success" />
      ) : (
        <WifiOff size={13} className="text-error" />
      )}
      <span>{label}</span>
      <Circle
        size={6}
        className={ok ? 'fill-success text-success' : 'fill-error text-error'}
      />
    </div>
  )
}
