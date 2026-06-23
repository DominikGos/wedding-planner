import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getTaskSchedule, type TaskResponse, type TaskStatus, type TaskType } from '../../../api/taskApi'
import type { RootState } from '../../../store'
import { setTasks } from '../../../store/slices/tasksSlice'
import { TimelineCard } from '../components/TimelineCard'
import { useTranslation } from 'react-i18next'

type ScheduleGroup = {
  date: string | null
  label: string
  tasks: TaskResponse[]
}

function formatDateLabel(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const leadingEmptyDays = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  return [
    ...Array.from({ length: leadingEmptyDays }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]
}

export function EventsPage() {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const tasks = useSelector((state: RootState) => state.tasks.items)
  const { user, token, activeWeddingId } = useSelector((state: RootState) => state.auth)
  const [loadedWeddingId, setLoadedWeddingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL')
  const [typeFilter, setTypeFilter] = useState<TaskType | 'ALL'>('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [calendarDate, setCalendarDate] = useState(() => new Date())
  const loading = Boolean(activeWeddingId && token && loadedWeddingId !== activeWeddingId)

  const statusOptions = useMemo<Array<{ value: TaskStatus | 'ALL'; label: string }>>(() => [
    { value: 'ALL', label: t('schedule.allStatuses') },
    { value: 'PENDING', label: t('schedule.statusPending') },
    { value: 'IN_PROGRESS', label: t('schedule.statusInProgress') },
    { value: 'COMPLETED', label: t('schedule.statusDone') },
  ], [t])

  const typeOptions = useMemo<Array<{ value: TaskType | 'ALL'; label: string }>>(() => [
    { value: 'ALL', label: t('schedule.allTypes') },
    { value: 'CATERING', label: t('schedule.typeCatering') },
    { value: 'DECORATION', label: t('schedule.typeDecoration') },
    { value: 'ENTERTAINMENT', label: t('schedule.typeEntertainment') },
  ], [t])

  const priorityOptions = useMemo(() => [
    { value: 'ALL', label: t('schedule.allPriorities') },
    { value: '1', label: t('schedule.priorityLow') },
    { value: '2', label: t('schedule.priorityMedium') },
    { value: '3', label: t('schedule.priorityHigh') },
  ], [t])

  useEffect(() => {
    if (!activeWeddingId || !token) return

    getTaskSchedule(activeWeddingId, { token })
      .then(schedule => {
        dispatch(setTasks(schedule))
        setError(null)
      })
      .catch(() => setError(t('schedule.loadError')))
      .finally(() => setLoadedWeddingId(activeWeddingId))
  }, [activeWeddingId, dispatch, token, t])

  const today = new Intl.DateTimeFormat('en-CA').format(new Date())
  const summary = {
    all: tasks.length,
    upcoming: tasks.filter(task => task.status !== 'COMPLETED' && task.dueDate && task.dueDate.split('T')[0] >= today).length,
    withoutDate: tasks.filter(task => !task.dueDate).length,
    completed: tasks.filter(task => task.status === 'COMPLETED').length,
  }
  const summaryCards = useMemo(() => [
    { label: t('schedule.statAll'), value: summary.all, color: '#db7e45' },
    { label: t('schedule.statUpcoming'), value: summary.upcoming, color: '#2f6db5' },
    { label: t('schedule.statNoDate'), value: summary.withoutDate, color: '#8c5a12' },
    { label: t('schedule.statDone'), value: summary.completed, color: '#35684f' },
  ], [t, summary])

  const filteredTasks = useMemo(() => {
    const phrase = search.trim().toLowerCase()

    return [...tasks]
      .filter(task => !phrase
        || task.name.toLowerCase().includes(phrase)
        || (task.description ?? '').toLowerCase().includes(phrase))
      .filter(task => statusFilter === 'ALL' || task.status === statusFilter)
      .filter(task => typeFilter === 'ALL' || task.type === typeFilter)
      .filter(task => priorityFilter === 'ALL' || task.priority === Number(priorityFilter))
      .filter(task => !selectedDate || task.dueDate?.split('T')[0] === selectedDate)
      .sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return (b.priority ?? 0) - (a.priority ?? 0)
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return a.dueDate.localeCompare(b.dueDate) || (b.priority ?? 0) - (a.priority ?? 0)
      })
  }, [priorityFilter, search, selectedDate, statusFilter, tasks, typeFilter])

  const groups = useMemo<ScheduleGroup[]>(() => {
    const result: ScheduleGroup[] = []

    filteredTasks.forEach(task => {
      const date = task.dueDate?.split('T')[0] ?? null
      const lastGroup = result[result.length - 1]

      if (!lastGroup || lastGroup.date !== date) {
        result.push({
          date,
          label: date ? formatDateLabel(date, i18n.language) : t('schedule.noDeadline'),
          tasks: [task],
        })
      } else {
        lastGroup.tasks.push(task)
      }
    })

    return result
  }, [filteredTasks, t, i18n.language])

  const calendarYear = calendarDate.getFullYear()
  const calendarMonth = calendarDate.getMonth()
  const monthDays = getMonthDays(calendarYear, calendarMonth)
  const monthLabel = new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'pl-PL', { month: 'long', year: 'numeric' }).format(calendarDate)
  const taskCountByDate = tasks.reduce<Record<string, number>>((counts, task) => {
    const date = task.dueDate?.split('T')[0]
    if (date) counts[date] = (counts[date] ?? 0) + 1
    return counts
  }, {})

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('ALL')
    setTypeFilter('ALL')
    setPriorityFilter('ALL')
    setSelectedDate(null)
  }

  if (!user) {
    return <section className='page-card' style={{ padding: '2rem', textAlign: 'center' }}>{t('schedule.requiresLogin')}</section>
  }

  if (!activeWeddingId) {
    return <section className='page-card' style={{ padding: '2rem', textAlign: 'center' }}>{t('schedule.noActiveEvent')}</section>
  }

  if (!token) {
    return <section className='page-card' style={{ padding: '2rem', textAlign: 'center' }}>{t('schedule.requiresGoogleLogin')}</section>
  }

  return (
    <section style={{ display: 'grid', gap: '1rem' }}>
      <article className='page-card' style={{ padding: '1.6rem', background: 'linear-gradient(180deg, var(--surface) 0%, var(--surface-soft) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <h1 className='page-title' style={{ fontSize: '2rem' }}>{t('schedule.pageTitle')}</h1>
            <p className='page-subtitle'>{t('schedule.pageSubtitle')}</p>
          </div>
          <button type='button' onClick={() => navigate('/tasks', { state: { openForm: true } })} className='button-primary'>
            {t('schedule.addTask')}
          </button>
        </div>

        <div style={{ marginTop: '1.2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.8rem' }}>
          {summaryCards.map(card => (
            <div key={card.label} style={{ padding: '1rem', borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <span style={{ display: 'block', color: 'var(--muted)', fontSize: '0.85rem' }}>{card.label}</span>
              <strong style={{ display: 'block', marginTop: '0.35rem', fontSize: '1.55rem', color: card.color }}>{card.value}</strong>
            </div>
          ))}
        </div>
      </article>

      {error && <div className='app-alert app-alert-danger' style={{ textAlign: 'center' }}>{error}</div>}

      <div className='schedule-layout'>
        <article className='page-card' style={{ padding: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
            <button type='button' onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth - 1, 1))} className='button-secondary' style={{ minHeight: '38px', padding: '0.45rem 0.7rem' }}>{t('schedule.prev')}</button>
            <strong style={{ textTransform: 'capitalize' }}>{monthLabel}</strong>
            <button type='button' onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth + 1, 1))} className='button-secondary' style={{ minHeight: '38px', padding: '0.45rem 0.7rem' }}>{t('schedule.next')}</button>
          </div>

          <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.35rem', textAlign: 'center' }}>
            {(i18n.language === 'en' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd']).map(day => <strong key={day} style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{day}</strong>)}
            {monthDays.map((day, index) => {
              const date = day ? `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : ''
              const count = taskCountByDate[date] ?? 0
              const selected = selectedDate === date

              return day ? (
                <button key={date} type='button' onClick={() => setSelectedDate(selected ? null : date)} style={{ minHeight: '48px', padding: '0.25rem', borderRadius: '10px', border: selected ? '1px solid var(--primary)' : '1px solid transparent', background: selected ? 'var(--primary-soft)' : count ? 'var(--surface-soft)' : 'transparent', cursor: 'pointer' }}>
                  <span style={{ display: 'block', fontWeight: selected ? 700 : 500 }}>{day}</span>
                  {count > 0 && <span style={{ display: 'block', marginTop: '0.15rem', color: '#db7e45', fontSize: '0.65rem', fontWeight: 600 }}>{t('schedule.taskCount', { count })}</span>}
                </button>
              ) : <span key={`empty-${index}`} />
            })}
          </div>

          {selectedDate && <button type='button' onClick={() => setSelectedDate(null)} className='button-secondary' style={{ marginTop: '1rem', width: '100%' }}>{t('schedule.showAll')}</button>}
        </article>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <article className='page-card schedule-filter-panel' style={{ padding: '1rem' }}>
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder={t('schedule.searchPlaceholder')} className='filter-control schedule-filter-search' />
            <div className='schedule-filter-row'>
              <select value={statusFilter} onChange={event => setStatusFilter(event.target.value as TaskStatus | 'ALL')} className='filter-control'>{statusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
              <select value={typeFilter} onChange={event => setTypeFilter(event.target.value as TaskType | 'ALL')} className='filter-control'>{typeOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
              <select value={priorityFilter} onChange={event => setPriorityFilter(event.target.value)} className='filter-control'>{priorityOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
              <button type='button' onClick={clearFilters} className='button-secondary'>{t('schedule.clearFilters')}</button>
            </div>
          </article>

          <article className='page-card' style={{ padding: '1.2rem', display: 'grid', gap: '1.5rem' }}>
            {loading && <div style={{ padding: '1rem', color: 'var(--muted)' }}>{t('schedule.loadingSchedule')}</div>}

            {!loading && !error && groups.map(group => (
              <section key={group.label} style={{ display: 'grid', gap: '0.9rem' }}>
                <h2 style={{ margin: 0, paddingBottom: '0.65rem', borderBottom: '1px solid var(--border)', fontSize: '1.05rem', textTransform: group.date ? 'capitalize' : 'none' }}>{group.label}</h2>
                {group.tasks.map(task => <TimelineCard key={task.id} task={task} />)}
              </section>
            ))}

            {!loading && !error && groups.length === 0 && (
              <div style={{ padding: '2rem 1rem', color: 'var(--muted)', textAlign: 'center' }}>
                {selectedDate ? t('schedule.noTasksOnDate') : tasks.length === 0 ? t('schedule.noTasks') : t('schedule.noResults')}
              </div>
            )}
          </article>
        </div>
      </div>
    </section>
  )
}
