import type { TaskResponse, TaskStatus, TaskType } from '../../../api/taskApi'
import { EventIcon, type EventIconName } from './EventIcon'
import { TimelineBadge } from './TimelineBadge'

const typeDetails: Record<TaskType, { label: string; color: string; icon: EventIconName }> = {
  CATERING: { label: 'Catering', color: '#ffbd45', icon: 'bell' },
  DECORATION: { label: 'Dekoracje', color: '#58c983', icon: 'leaf' },
  ENTERTAINMENT: { label: 'Rozrywka', color: '#ffad63', icon: 'music' },
}

const statusLabels: Record<TaskStatus, string> = {
  PENDING: 'Do zrobienia',
  IN_PROGRESS: 'W trakcie',
  COMPLETED: 'Zrobione',
}

const priorityLabels: Record<number, string> = {
  1: 'Niski',
  2: 'Średni',
  3: 'Wysoki',
}

type TimelineCardProps = {
  task: TaskResponse
}

export function TimelineCard({ task }: TimelineCardProps) {
  const type = typeDetails[task.type]
  const time = task.dueDate?.split('T')[1]?.slice(0, 5)
  const completed = task.status === 'COMPLETED'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '12px minmax(0, 1fr)', gap: '0.8rem', alignItems: 'stretch' }}>
      <div style={{ position: 'relative', display: 'grid', justifyItems: 'center' }}>
        <span style={{ width: '10px', height: '10px', borderRadius: '999px', background: type.color, marginTop: '1.05rem', zIndex: 1 }} />
        <span style={{ position: 'absolute', top: '1.45rem', bottom: '-1rem', width: '2px', background: '#f2e6d8' }} />
      </div>

      <div style={{ border: '1px solid #f0e4d5', borderRadius: '16px', background: completed ? '#f8f7f5' : '#fffdfa', padding: '1rem', opacity: completed ? 0.75 : 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <span style={{ width: '3rem', height: '3rem', borderRadius: '16px', background: `${type.color}20`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <EventIcon name={type.icon} color={type.color} />
            </span>
            <span>
              <strong style={{ display: 'block', fontSize: '1rem' }}>{task.name}</strong>
              <span style={{ display: 'block', marginTop: '0.35rem', color: 'var(--muted)' }}>{type.label}</span>
              {task.description && <span style={{ display: 'block', marginTop: '0.5rem', color: 'var(--muted)', lineHeight: 1.45 }}>{task.description}</span>}
            </span>
          </div>

          <div style={{ display: 'grid', gap: '0.55rem', justifyItems: 'end' }}>
            <TimelineBadge status={statusLabels[task.status]} />
            <span style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Priorytet: {priorityLabels[task.priority ?? 0] ?? 'Nieokreślony'}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--muted)', fontSize: '0.88rem' }}>
              <EventIcon name='clock' color='var(--muted)' size={16} />
              {time || 'Bez godziny'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
