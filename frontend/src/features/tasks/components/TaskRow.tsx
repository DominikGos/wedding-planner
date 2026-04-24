import type { TaskItem } from '../data/tasksMock'

function getBadgeStyles(status: TaskItem['status']) {
  if (status === 'Zrobione') {
    return { background: '#daf6e5', color: '#14834b' }
  }

  if (status === 'W trakcie') {
    return { background: '#fff3cf', color: '#d37b00' }
  }

  return { background: '#e8efff', color: '#4b6acb' }
}

function formatBudget(value: number) {
  if (value <= 0) {
    return '-'
  }

  return `${value.toLocaleString('pl-PL')} PLN`
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-')
  return `${day}.${month}.${year}`
}

type TaskRowProps = {
  task: TaskItem
  isSelected: boolean
  onSelect: () => void
  onToggle: () => void
}

export function TaskRow({
  task,
  isSelected,
  onSelect,
  onToggle,
}: TaskRowProps) {
  const badgeStyles = getBadgeStyles(task.status)

  return (
    <button
      type='button'
      onClick={onSelect}
      style={{
        width: '100%',
        border: 'none',
        borderTop: '1px solid #f3e9de',
        background: isSelected ? '#fff8f1' : '#fffdfa',
        padding: '0.95rem 1rem',
        display: 'grid',
        gridTemplateColumns: '34px minmax(220px, 2.2fr) 1fr 0.9fr 0.9fr 0.9fr',
        gap: '0.9rem',
        alignItems: 'center',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <input
        type='checkbox'
        checked={task.checked}
        onChange={() => onToggle()}
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '1.1rem',
          height: '1.1rem',
          accentColor: '#d67c3a',
          cursor: 'pointer',
        }}
      />

      <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'center' }}>
        <span
          style={{
            width: '2.7rem',
            height: '2.7rem',
            borderRadius: '16px',
            background: `${task.color}20`,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: '0.9rem',
              height: '0.9rem',
              borderRadius: '999px',
              background: task.color,
              display: 'block',
            }}
          />
        </span>

        <span>
          <strong style={{ display: 'block', fontSize: '1rem' }}>{task.name}</strong>
          <span style={{ display: 'block', marginTop: '0.25rem', color: 'var(--muted)' }}>
            {task.description}
          </span>
        </span>
      </div>

      <span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.32rem 0.75rem',
            borderRadius: '999px',
            background: `${task.color}1c`,
            color: task.color,
            fontWeight: 600,
          }}
        >
          {task.category}
        </span>
      </span>

      <span style={{ color: 'var(--text)' }}>{formatDate(task.date)}</span>

      <span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.32rem 0.75rem',
            borderRadius: '999px',
            background: badgeStyles.background,
            color: badgeStyles.color,
            fontWeight: 600,
          }}
        >
          {task.status}
        </span>
      </span>

      <strong style={{ color: '#1f1a14' }}>{formatBudget(task.budget)}</strong>
    </button>
  )
}
