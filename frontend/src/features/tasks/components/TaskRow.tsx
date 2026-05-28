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
  if (!value) return '-';
  const parts = value.split('-')
  if (parts.length < 3) return value;
  const [year, month, day] = parts
  return `${day}.${month}.${year}`
}

type TaskRowProps = {
  task: TaskItem
  isSelected: boolean
  onSelect: () => void
  onToggle: () => void
  onStatusChange: (status: TaskItem['status']) => void
}

export function TaskRow({
  task,
  isSelected,
  onSelect,
  onToggle,
  onStatusChange,
}: TaskRowProps) {
  const badgeStyles = getBadgeStyles(task.status)

  return (
    <div
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
        transition: 'background 0.2s'
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
          <strong style={{ display: 'block', fontSize: '1rem', textDecoration: task.checked ? 'line-through' : 'none', color: task.checked ? 'var(--muted)' : 'var(--text)' }}>
            {task.name}
          </strong>
          <span style={{ display: 'block', marginTop: '0.25rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
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
            fontSize: '0.82rem'
          }}
        >
          {task.category}
        </span>
      </span>

      <span style={{ color: 'var(--text)', fontSize: '0.9rem' }}>{formatDate(task.date)}</span>

      {/* Interactive Select Status Badge */}
      <span onClick={(event) => event.stopPropagation()} style={{ display: 'inline-flex' }}>
        <select
          value={task.status}
          onChange={(e) => onStatusChange(e.target.value as any)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.32rem 0.6rem',
            borderRadius: '999px',
            background: badgeStyles.background,
            color: badgeStyles.color,
            fontWeight: 600,
            fontSize: '0.82rem',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            textAlign: 'center',
            appearance: 'none',
            WebkitAppearance: 'none',
            paddingRight: '0.6rem'
          }}
        >
          <option value="Do zrobienia" style={{ background: '#fff', color: '#2f2a24' }}>Do zrobienia</option>
          <option value="W trakcie" style={{ background: '#fff', color: '#2f2a24' }}>W trakcie</option>
          <option value="Zrobione" style={{ background: '#fff', color: '#2f2a24' }}>Zrobione</option>
        </select>
      </span>

      <strong style={{ color: '#1f1a14', fontSize: '0.95rem' }}>{formatBudget(task.budget)}</strong>
    </div>
  )
}
