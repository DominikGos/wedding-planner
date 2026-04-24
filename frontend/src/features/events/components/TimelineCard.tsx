import type { TimelineItem } from '../data/eventsMock'
import { EventIcon } from './EventIcon'
import { TimelineBadge } from './TimelineBadge'

type TimelineCardProps = {
  item: TimelineItem
  isSelected: boolean
  onClick: () => void
}

export function TimelineCard({
  item,
  isSelected,
  onClick,
}: TimelineCardProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '88px 12px minmax(0, 1fr)',
        gap: '0.8rem',
        alignItems: 'stretch',
      }}
    >
      <div style={{ textAlign: 'left', paddingTop: '0.35rem' }}>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.82rem' }}>{item.month}</p>
        <strong style={{ display: 'block', fontSize: '1.1rem', marginTop: '0.2rem' }}>{item.day}</strong>
        <p style={{ margin: '0.2rem 0 0', color: 'var(--muted)' }}>{item.weekDay}</p>
      </div>

      <div style={{ position: 'relative', display: 'grid', justifyItems: 'center' }}>
        <span
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '999px',
            background: item.color,
            marginTop: '1.05rem',
            zIndex: 1,
          }}
        />
        <span
          style={{
            position: 'absolute',
            top: '1.45rem',
            bottom: '-1rem',
            width: '2px',
            background: '#f2e6d8',
          }}
        />
      </div>

      <button
        type='button'
        onClick={onClick}
        style={{
          border: `1px solid ${isSelected ? item.color : '#f0e4d5'}`,
          borderRadius: '16px',
          background: isSelected ? '#fff8f1' : '#fffdfa',
          padding: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span
            style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '16px',
              background: `${item.color}20`,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <EventIcon name={item.icon} color={item.color} />
          </span>

          <span>
            <strong style={{ display: 'block', fontSize: '1rem' }}>{item.title}</strong>
            <span style={{ display: 'block', marginTop: '0.35rem', color: 'var(--muted)' }}>
              {item.subtitle}
              {item.category ? ` - ${item.category}` : ''}
            </span>
          </span>
        </span>

        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--muted)' }}>
            <EventIcon name='clock' color='var(--muted)' size={16} />
            {item.time}
          </span>
          <TimelineBadge status={item.status} />
        </span>
      </button>
    </div>
  )
}
