import { useState } from 'react'
import { Save, RotateCcw, Server, Globe, Cpu, Check } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { getSettings, saveSettings } from '@/store/settings'

export function Settings() {
  const [form, setForm] = useState(getSettings)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    saveSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleReset() {
    const defaults = {
      engineGateway: `http://${window.location.hostname}:8100`,
      openclawGateway: `http://${window.location.hostname}:18789`,
      model: 'server' as const,
      language: 'zh' as const,
      theme: 'dark' as const,
    }
    setForm(defaults)
    saveSettings(defaults)
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      {/* Connection */}
      <Card>
        <h2 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
          <Globe size={16} className="text-accent-light" />
          连接设置
        </h2>
        <div className="space-y-4">
          <SettingField
            label="Engine Gateway"
            description="后端服务网关地址"
            value={form.engineGateway}
            onChange={(v) => setForm({ ...form, engineGateway: v })}
            icon={Server}
          />
          <SettingField
            label="OpenClaw Gateway"
            description="AI 交互网关地址"
            value={form.openclawGateway}
            onChange={(v) => setForm({ ...form, openclawGateway: v })}
            icon={Server}
          />
        </div>
      </Card>

      {/* AI Model */}
      <Card>
        <h2 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
          <Cpu size={16} className="text-accent-light" />
          AI 模型
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <ModelOption
            label="服务端模型"
            description="Qwen3.5-35B-A3B (DGX Spark2)"
            selected={form.model === 'server'}
            onClick={() => setForm({ ...form, model: 'server' })}
          />
          <ModelOption
            label="本地模型"
            description="Qwen3.5-4B (Jetson Orin)"
            selected={form.model === 'local'}
            onClick={() => setForm({ ...form, model: 'local' })}
          />
        </div>
      </Card>

      {/* Language */}
      <Card>
        <h2 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
          <Globe size={16} className="text-accent-light" />
          界面语言
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <ModelOption
            label="中文"
            description="简体中文界面"
            selected={form.language === 'zh'}
            onClick={() => setForm({ ...form, language: 'zh' })}
          />
          <ModelOption
            label="English"
            description="English interface"
            selected={form.language === 'en'}
            onClick={() => setForm({ ...form, language: 'en' })}
          />
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-colors ${
            saved
              ? 'bg-success/15 text-success'
              : 'bg-accent text-white hover:bg-accent-light'
          }`}
        >
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? '已保存' : '保存设置'}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm bg-bg-tertiary text-text-secondary hover:bg-bg-hover transition-colors"
        >
          <RotateCcw size={16} />
          重置默认
        </button>
      </div>

      {/* Version Info */}
      <p className="text-xs text-text-muted">
        AI Workflow Web v0.1.0 -- Lightweight web frontend for AI-Workflow-Terminal
      </p>
    </div>
  )
}

function SettingField({
  label,
  description,
  value,
  onChange,
  icon: Icon,
}: {
  label: string
  description: string
  value: string
  onChange: (v: string) => void
  icon: React.ElementType
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-xs text-text-secondary mb-1.5">
        <Icon size={12} />
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-bg-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary font-mono focus:outline-none focus:border-accent/50 transition-colors"
      />
      <p className="text-xs text-text-muted mt-1">{description}</p>
    </div>
  )
}

function ModelOption({
  label,
  description,
  selected,
  onClick,
}: {
  label: string
  description: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start p-4 rounded-lg border text-left transition-colors ${
        selected
          ? 'border-accent/50 bg-accent-dim'
          : 'border-border bg-bg-tertiary hover:border-border-light'
      }`}
    >
      <span className={`text-sm font-medium ${selected ? 'text-accent-light' : 'text-text-primary'}`}>
        {label}
      </span>
      <span className="text-xs text-text-muted mt-0.5">{description}</span>
    </button>
  )
}
