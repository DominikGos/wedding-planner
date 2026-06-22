import { DashboardIcon } from './DashboardIcon'
import { EventBadge } from './EventBadge'

type EventCardProps = {
  title: string
  date: string
  time: string
  status: string
}

export function EventCard({
  title,
  date,
  time,
  status,
}: EventCardProps) {
  return (
    <div
      className='dashboard-event-card'
      style={{
        borderRadius: '16px',
        padding: '1.15rem',
        display: 'flex',
        justifyContent: 'space-between',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '14px',
            background: 'var(--surface-soft)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <DashboardIcon
            name={status === 'Wazne' ? 'alert' : 'calendar'}
            color={status === 'Wazne' ? 'var(--primary)' : 'var(--muted)'}
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
