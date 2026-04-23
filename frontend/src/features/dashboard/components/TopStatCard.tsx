import type { DashboardIconName } from '../data/dashboardMock'
import { DashboardIcon } from './DashboardIcon'

type TopStatCardProps = {
  title: string
  value: string
  note: string
  color: string
  icon: DashboardIconName
  isHovered: boolean
  onHoverStart: () => void
  onHoverEnd: () => void
}

export function TopStatCard({
  title,
  value,
  note,
  color,
  icon,
  isHovered,
  onHoverStart,
  onHoverEnd,
}: TopStatCardProps) {
  return (
    <article
      className='stat-item'
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      style={{
        padding: '1.15rem',
        textAlign: 'left',
        borderColor: isHovered ? color : 'var(--border)',
        background: isHovered ? '#fff9f3' : '#fff',
        boxShadow: isHovered ? '0 8px 24px rgba(47, 42, 36, 0.08)' : 'none',
        transition: 'border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '0.75rem',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <span style={{ color: 'var(--muted)' }}>{title}</span>
          <strong style={{ color, fontSize: '1.35rem', marginTop: '0.55rem' }}>{value}</strong>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--muted)' }}>{note}</p>
        </div>

        <div
          style={{
            width: '3.1rem',
            height: '3.1rem',
            borderRadius: '14px',
            background: '#fcf6f1',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <DashboardIcon name={icon} color={color} />
        </div>
      </div>
    </article>
  )
}
