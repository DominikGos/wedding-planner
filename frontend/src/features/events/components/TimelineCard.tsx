import type { TaskResponse, TaskStatus, TaskType } from '../../../api/taskApi'
import { EventIcon, type EventIconName } from './EventIcon'
import { TimelineBadge } from './TimelineBadge'
import { useTranslation } from 'react-i18next'

type TimelineCardProps = {
  task: TaskResponse
}

export function TimelineCard({ task }: TimelineCardProps) {
  const { t } = useTranslation()

  const typeDetails: Record<TaskType, { label: string; color: string; icon: EventIconName }> = {
    CATERING: { label: t('schedule.typeCatering'), color: '#ffbd45', icon: 'bell' },
    DECORATION: { label: t('schedule.typeDecoration'), color: '#58c983', icon: 'leaf' },
    ENTERTAINMENT: { label: t('schedule.typeEntertainment'), color: '#ffad63', icon: 'music' },
  }

  const statusLabels: Record<TaskStatus, string> = {
    PENDING: t('schedule.statusPending'),
    IN_PROGRESS: t('schedule.statusInProgress'),
    COMPLETED: t('schedule.statusDone'),
  }

  const priorityLabels: Record<number, string> = {
    1: t('schedule.priorityLow'),
    2: t('schedule.priorityMedium'),
    3: t('schedule.priorityHigh'),
  }

  const type = typeDetails[task.type]
  const time = task.dueDate?.split('T')[1]?.slice(0, 5)
  const completed = task.status === 'COMPLETED'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '12px minmax(0, 1fr)', gap: '0.8rem', alignItems: 'stretch' }}>
      <div style={{ position: 'relative', display: 'grid', justifyItems: 'center' }}>
        <span style={{ width: '10px', height: '10px', borderRadius: '999px', background: type.color, marginTop: '1.05rem', zIndex: 1 }} />
        <span style={{ position: 'absolute', top: '1.45rem', bottom: '-1rem', width: '2px', background: 'var(--border)' }} />
      </div>

      <div className='surface-panel' style={{ padding: '1rem', opacity: completed ? 0.75 : 1 }}>
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
            <span style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{t('schedule.priority', { level: priorityLabels[task.priority ?? 0] ?? t('schedule.priorityUnspecified') })}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--muted)', fontSize: '0.88rem' }}>
              <EventIcon name='clock' color='var(--muted)' size={16} />
              {time || t('schedule.noTime')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
