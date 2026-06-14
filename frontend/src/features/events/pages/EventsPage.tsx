import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getTaskSchedule, type TaskResponse, type TaskStatus, type TaskType } from '../../../api/taskApi'
import type { RootState } from '../../../store'
import { setTasks } from '../../../store/slices/tasksSlice'
import { TimelineCard } from '../components/TimelineCard'

type ScheduleGroup = {
  date: string | null
  label: string
  tasks: TaskResponse[]
}

const statusOptions: Array<{ value: TaskStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Wszystkie statusy' },
  { value: 'PENDING', label: 'Do zrobienia' },
  { value: 'IN_PROGRESS', label: 'W trakcie' },
  { value: 'COMPLETED', label: 'Zrobione' },
]

const typeOptions: Array<{ value: TaskType | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Wszystkie typy' },
  { value: 'CATERING', label: 'Catering' },
  { value: 'DECORATION', label: 'Dekoracje' },
  { value: 'ENTERTAINMENT', label: 'Rozrywka' },
]

const priorityOptions = [
  { value: 'ALL', label: 'Wszystkie priorytety' },
  { value: '1', label: 'Niski' },
  { value: '2', label: 'Średni' },
  { value: '3', label: 'Wysoki' },
]

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat('pl-PL', {
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

  useEffect(() => {
    if (!activeWeddingId || !token) return

    getTaskSchedule(activeWeddingId, { token })
      .then(schedule => {
        dispatch(setTasks(schedule))
        setError(null)
      })
      .catch(() => setError('Nie udało się pobrać harmonogramu z backendu.'))
      .finally(() => setLoadedWeddingId(activeWeddingId))
  }, [activeWeddingId, dispatch, token])

  const today = new Intl.DateTimeFormat('en-CA').format(new Date())
  const summary = {
    all: tasks.length,
    upcoming: tasks.filter(task => task.status !== 'COMPLETED' && task.dueDate && task.dueDate.split('T')[0] >= today).length,
    withoutDate: tasks.filter(task => !task.dueDate).length,
    completed: tasks.filter(task => task.status === 'COMPLETED').length,
  }
  const summaryCards = [
    { label: 'Wszystkie zadania', value: summary.all, color: '#db7e45' },
    { label: 'Najbliższe zadania', value: summary.upcoming, color: '#2f6db5' },
    { label: 'Bez terminu', value: summary.withoutDate, color: '#8c5a12' },
    { label: 'Zrobione', value: summary.completed, color: '#35684f' },
  ]

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
          label: date ? formatDateLabel(date) : 'Bez terminu',
          tasks: [task],
        })
      } else {
        lastGroup.tasks.push(task)
      }
    })

    return result
  }, [filteredTasks])

  const calendarYear = calendarDate.getFullYear()
  const calendarMonth = calendarDate.getMonth()
  const monthDays = getMonthDays(calendarYear, calendarMonth)
  const monthLabel = new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' }).format(calendarDate)
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
    return <section className='page-card' style={{ padding: '2rem', textAlign: 'center' }}>Zaloguj się, aby zobaczyć harmonogram.</section>
  }

  if (!activeWeddingId) {
    return <section className='page-card' style={{ padding: '2rem', textAlign: 'center' }}>Wybierz aktywne wesele, aby zobaczyć harmonogram.</section>
  }

  if (!token) {
    return <section className='page-card' style={{ padding: '2rem', textAlign: 'center' }}>Harmonogram z backendu jest dostępny po zalogowaniu przez Google.</section>
  }

  return (
    <section style={{ display: 'grid', gap: '1rem' }}>
      <article className='page-card' style={{ padding: '1.6rem', background: 'linear-gradient(180deg, #fffdf9 0%, #fff8f1 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <h1 className='page-title' style={{ fontSize: '2rem' }}>Harmonogram</h1>
            <p className='page-subtitle'>Plan zadań aktywnego wesela uporządkowany według terminów.</p>
          </div>
          <button type='button' onClick={() => navigate('/tasks', { state: { openForm: true } })} className='button-primary'>
            Dodaj nowe zadanie
          </button>
        </div>

        <div style={{ marginTop: '1.2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.8rem' }}>
          {summaryCards.map(card => (
            <div key={card.label} style={{ padding: '1rem', borderRadius: '14px', border: '1px solid #efe1d0', background: '#fffdfa' }}>
              <span style={{ display: 'block', color: 'var(--muted)', fontSize: '0.85rem' }}>{card.label}</span>
              <strong style={{ display: 'block', marginTop: '0.35rem', fontSize: '1.55rem', color: card.color }}>{card.value}</strong>
            </div>
          ))}
        </div>
      </article>

      {error && <div style={{ padding: '1rem', borderRadius: '12px', background: '#fff2f2', color: '#c53030', fontWeight: 600, textAlign: 'center' }}>{error}</div>}

      <div className='schedule-layout'>
        <article className='page-card' style={{ padding: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
            <button type='button' onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth - 1, 1))} className='button-secondary' style={{ minHeight: '38px', padding: '0.45rem 0.7rem' }}>Poprzedni</button>
            <strong style={{ textTransform: 'capitalize' }}>{monthLabel}</strong>
            <button type='button' onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth + 1, 1))} className='button-secondary' style={{ minHeight: '38px', padding: '0.45rem 0.7rem' }}>Następny</button>
          </div>

          <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.35rem', textAlign: 'center' }}>
            {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'].map(day => <strong key={day} style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{day}</strong>)}
            {monthDays.map((day, index) => {
              const date = day ? `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : ''
              const count = taskCountByDate[date] ?? 0
              const selected = selectedDate === date

              return day ? (
                <button key={date} type='button' onClick={() => setSelectedDate(selected ? null : date)} style={{ minHeight: '48px', padding: '0.25rem', borderRadius: '10px', border: selected ? '1px solid #db7e45' : '1px solid transparent', background: selected ? '#fff1e7' : count ? '#fffaf4' : 'transparent', cursor: 'pointer' }}>
                  <span style={{ display: 'block', fontWeight: selected ? 700 : 500 }}>{day}</span>
                  {count > 0 && <span style={{ display: 'block', marginTop: '0.15rem', color: '#db7e45', fontSize: '0.65rem', fontWeight: 600 }}>{count} zad.</span>}
                </button>
              ) : <span key={`empty-${index}`} />
            })}
          </div>

          {selectedDate && <button type='button' onClick={() => setSelectedDate(null)} className='button-secondary' style={{ marginTop: '1rem', width: '100%' }}>Pokaż wszystkie</button>}
        </article>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <article className='page-card schedule-filter-panel' style={{ padding: '1rem' }}>
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder='Szukaj po nazwie lub opisie...' className='filter-control schedule-filter-search' />
            <div className='schedule-filter-row'>
              <select value={statusFilter} onChange={event => setStatusFilter(event.target.value as TaskStatus | 'ALL')} className='filter-control'>{statusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
              <select value={typeFilter} onChange={event => setTypeFilter(event.target.value as TaskType | 'ALL')} className='filter-control'>{typeOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
              <select value={priorityFilter} onChange={event => setPriorityFilter(event.target.value)} className='filter-control'>{priorityOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
              <button type='button' onClick={clearFilters} className='button-secondary'>Wyczyść filtry</button>
            </div>
          </article>

          <article className='page-card' style={{ padding: '1.2rem', display: 'grid', gap: '1.5rem' }}>
            {loading && <div style={{ padding: '1rem', color: 'var(--muted)' }}>Ładowanie harmonogramu...</div>}

            {!loading && !error && groups.map(group => (
              <section key={group.label} style={{ display: 'grid', gap: '0.9rem' }}>
                <h2 style={{ margin: 0, paddingBottom: '0.65rem', borderBottom: '1px solid #f1e8dc', fontSize: '1.05rem', textTransform: group.date ? 'capitalize' : 'none' }}>{group.label}</h2>
                {group.tasks.map(task => <TimelineCard key={task.id} task={task} />)}
              </section>
            ))}

            {!loading && !error && groups.length === 0 && (
              <div style={{ padding: '2rem 1rem', color: 'var(--muted)', textAlign: 'center' }}>
                {selectedDate ? 'Brak zadań w wybranym dniu.' : tasks.length === 0 ? 'Brak zadań w harmonogramie aktywnego wesela.' : 'Brak wyników dla wybranych filtrów.'}
              </div>
            )}
          </article>
        </div>
      </div>
    </section>
  )
}
