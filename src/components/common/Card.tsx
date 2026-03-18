import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`bg-bg-secondary border border-border rounded-xl p-5 ${
        onClick ? 'cursor-pointer hover:border-border-light transition-colors' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
