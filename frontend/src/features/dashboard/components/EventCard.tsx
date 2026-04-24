import { DashboardIcon } from './DashboardIcon'
import { EventBadge } from './EventBadge'

type EventCardProps = {
  title: string
  date: string
  time: string
  status: string
  isHovered: boolean
  onHoverStart: () => void
  onHoverEnd: () => void
}

export function EventCard({
  title,
  date,
  time,
  status,
  isHovered,
  onHoverStart,
  onHoverEnd,
}: EventCardProps) {
  return (
    <div
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      style={{
        border: `1px solid ${isHovered ? '#d6a061' : '#f2e6d8'}`,
        borderRadius: '16px',
        padding: '1.15rem',
        display: 'flex',
        justifyContent: 'space-between',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap',
        background: isHovered ? '#fff9f3' : '#fffdfa',
        transition: 'border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
        boxShadow: isHovered ? '0 8px 24px rgba(47, 42, 36, 0.06)' : 'none',
      }}
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '14px',
            background: '#fcf1f6',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <DashboardIcon
            name={status === 'Wazne' ? 'alert' : 'calendar'}
            color={status === 'Wazne' ? '#d6a061' : 'var(--muted)'}
            size={24}
          />
        </div>

        <div>
          <strong style={{ display: 'block', fontSize: '1rem' }}>{title}</strong>
          <p style={{ margin: '0.4rem 0 0', color: 'var(--muted)' }}>
            {date} - {time}
          </p>
        </div>
      </div>

      <EventBadge status={status} />
    </div>
  )
}
