import type { DashboardIconName } from '../data/dashboardMock'
import { DashboardIcon } from './DashboardIcon'

type GuestStatCardProps = {
  value: string
  label: string
  color: string
  background: string
  icon: DashboardIconName
  isHovered: boolean
  onHoverStart: () => void
  onHoverEnd: () => void
}

export function GuestStatCard({
  value,
  label,
  color,
  background,
  icon,
  isHovered,
  onHoverStart,
  onHoverEnd,
}: GuestStatCardProps) {
  return (
    <div
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      style={{
        border: `1px solid ${isHovered ? color : `${color}33`}`,
        borderRadius: '16px',
        background,
        padding: '1.4rem 1rem',
        textAlign: 'center',
        boxShadow: isHovered ? '0 8px 24px rgba(47, 42, 36, 0.06)' : 'none',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
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
