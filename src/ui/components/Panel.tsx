import type { ReactNode } from 'react'

interface PanelProps {
  title?: string
  children: ReactNode
  className?: string
  actions?: ReactNode
}

export function Panel({ title, children, className, actions }: PanelProps) {
  return (
    <section className={`panel ${className ?? ''}`}>
      {(title || actions) && (
        <header className="panel-header">
          {title && <h3>{title}</h3>}
          {actions && <div className="panel-actions">{actions}</div>}
        </header>
      )}
      <div className="panel-body">{children}</div>
    </section>
  )
}
