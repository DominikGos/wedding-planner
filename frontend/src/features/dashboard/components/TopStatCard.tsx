import type { DashboardIconName } from '../data/dashboardMock'
import { DashboardIcon } from './DashboardIcon'

type TopStatCardProps = {
  title: string
  value: string
  note: string
  color: string
  icon: DashboardIconName
}

export function TopStatCard({
  title,
  value,
  note,
  color,
  icon,
}: TopStatCardProps) {
  return (
    <article
      className='stat-item dashboard-top-stat'
      style={{
        padding: '1.15rem',
        textAlign: 'left',
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
            background: 'var(--surface-soft)',
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
