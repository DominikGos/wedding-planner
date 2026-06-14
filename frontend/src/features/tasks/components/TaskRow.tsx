import type { TaskStatus } from '../../../api/taskApi'
import { taskStatuses, taskTypes, type TaskItem } from '../data/tasksMock'

type TaskRowProps = {
  task: TaskItem
  isSelected: boolean
  onSelect: () => void
  onStatusChange: (status: TaskStatus) => void
}

export function TaskRow({ task, isSelected, onSelect, onStatusChange }: TaskRowProps) {
  const date = task.dueDate ? task.dueDate.split('T')[0].split('-').reverse().join('.') : '-'
  const budget = task.totalPrice ?? (
    task.pricePerGuest != null && task.numberOfGuests != null
      ? task.pricePerGuest * task.numberOfGuests
      : null
  )
  const type = taskTypes.find(item => item.value === task.type)?.label ?? task.type

  return (
    <div onClick={onSelect} style={{ borderTop: '1px solid #f3e9de', background: isSelected ? '#fff8f1' : '#fffdfa', padding: '0.95rem 1rem', display: 'grid', gridTemplateColumns: 'minmax(220px, 2.2fr) 1fr 0.9fr 0.9fr 0.9fr', gap: '0.9rem', alignItems: 'center', cursor: 'pointer' }}>
      <span>
        <strong style={{ display: 'block', fontSize: '1rem' }}>{task.name}</strong>
        <span style={{ display: 'block', marginTop: '0.25rem', color: 'var(--muted)', fontSize: '0.85rem' }}>{task.description || 'Brak opisu'}</span>
      </span>
      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{type}</span>
      <span>{date}</span>
      <span onClick={event => event.stopPropagation()}>
        <select value={task.status} onChange={event => onStatusChange(event.target.value as TaskStatus)} className='task-status-select'>
          {taskStatuses.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}
        </select>
      </span>
      <strong>{budget !== null ? `${budget.toLocaleString('pl-PL')} PLN` : '—'}</strong>
    </div>
  )
}
