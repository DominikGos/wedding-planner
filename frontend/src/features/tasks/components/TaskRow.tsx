import { useTranslation } from 'react-i18next'
import type { TaskStatus } from '../../../api/taskApi'
import { taskStatuses, type TaskItem } from '../data/tasksMock'

type TaskRowProps = {
  task: TaskItem
  isSelected: boolean
  onSelect: () => void
  onStatusChange: (status: TaskStatus) => void
}

export function TaskRow({ task, isSelected, onSelect, onStatusChange }: TaskRowProps) {
  const { t } = useTranslation()
  const date = task.dueDate ? task.dueDate.split('T')[0].split('-').reverse().join('.') : '-'
  const budget = task.totalPrice ?? (
    task.pricePerGuest != null && task.numberOfGuests != null
      ? task.pricePerGuest * task.numberOfGuests
      : null
  )
  const type = t(`tasks.types.${task.type}`, { defaultValue: task.type })

  return (
    <div className="task-row" onClick={onSelect} style={{ borderTop: '1px solid var(--border)', background: isSelected ? 'var(--primary-soft)' : 'var(--surface)', padding: '0.95rem 1rem', display: 'grid', gridTemplateColumns: 'minmax(220px, 2.2fr) 1fr 0.9fr 0.9fr 0.9fr', gap: '0.9rem', alignItems: 'center', cursor: 'pointer' }}>
      <span>
        <strong style={{ display: 'block', fontSize: '1rem' }}>{task.name}</strong>
        <span style={{ display: 'block', marginTop: '0.25rem', color: 'var(--muted)', fontSize: '0.85rem' }}>{task.description || t('tasks.noDescription')}</span>
      </span>
      <span style={{ color: 'var(--text)', fontWeight: 600 }}>{type}</span>
      <span>{date}</span>
      <span onClick={event => event.stopPropagation()}>
        <select value={task.status} onChange={event => onStatusChange(event.target.value as TaskStatus)} className='task-status-select'>
          {taskStatuses.map(status => (
            <option key={status.value} value={status.value}>
              {t(`tasks.statuses.${status.value}`)}
            </option>
          ))}
        </select>
      </span>
      <strong>{budget !== null ? `${budget.toLocaleString('pl-PL')} PLN` : '—'}</strong>
    </div>
  )
}
