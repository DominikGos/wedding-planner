import type { Reminder } from '../data/eventsMock'
import { EventIcon } from './EventIcon'

type ReminderItemProps = Reminder & {
  isSelected: boolean
  onClick: () => void
}

export function ReminderItem({
  title,
  date,
  time,
  color,
  icon,
  isSelected,
  onClick,
}: ReminderItemProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      style={{
        display: 'flex',
        gap: '0.9rem',
        alignItems: 'center',
        border: `1px solid ${isSelected ? color : 'transparent'}`,
        background: isSelected ? '#fff8f1' : 'transparent',
        borderRadius: '14px',
        padding: '0.4rem',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span
        style={{
          width: '2.8rem',
          height: '2.8rem',
          borderRadius: '16px',
          background: `${color}20`,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        <EventIcon name={icon} color={color} size={18} />
      </span>

      <span>
        <strong style={{ display: 'block', fontSize: '0.96rem' }}>{title}</strong>
        <span style={{ display: 'block', marginTop: '0.3rem', color: 'var(--muted)' }}>
          {date} - {time}
        </span>
      </span>
    </button>
  )
}
