import type { DashboardIconName } from '../data/dashboardMock'
import { DashboardIcon } from './DashboardIcon'

type GuestStatCardProps = {
  value: string
  label: string
  color: string
  background: string
  icon: DashboardIconName
}

export function GuestStatCard({
  value,
  label,
  color,
  icon,
}: GuestStatCardProps) {
  return (
    <div
      className='guest-stat-card'
      style={{
        borderRadius: '16px',
        padding: '1.4rem 1rem',
        textAlign: 'center',
      }}
    >
      <div style={{ display: 'grid', placeItems: 'center' }}>
        <DashboardIcon name={icon} color={color} size={34} strokeWidth={2} />
      </div>
      <strong style={{ display: 'block', marginTop: '0.7rem', fontSize: '2rem', color }}>{value}</strong>
      <span style={{ display: 'block', marginTop: '0.35rem', color }}>{label}</span>
    </div>
  )
}
