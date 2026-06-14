import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createTask, deleteTask, getTasks, updateTask, updateTaskStatus, type TaskRequest, type TaskStatus } from '../../../api/taskApi'
import type { RootState } from '../../../store'
import { setTasks } from '../../../store/slices/tasksSlice'
import { TaskForm, type TaskFormState } from '../components/TaskForm'
import { TaskRow } from '../components/TaskRow'
import { TaskStats } from '../components/TaskStats'
import { taskStatuses, taskTypes, type TaskItem } from '../data/tasksMock'

const emptyForm: TaskFormState = {
  type: 'CATERING',
  name: '',
  description: '',
  date: '',
  time: '',
  priority: '2',
  price: '',
  numberOfGuests: '',
  detail: '',
}

export function TasksPage() {
  const dispatch = useDispatch()
  const tasks = useSelector((state: RootState) => state.tasks.items)
  const { activeWeddingId, token } = useSelector((state: RootState) => state.auth)

  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [taskForm, setTaskForm] = useState<TaskFormState>(emptyForm)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(Boolean(activeWeddingId && token))
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const loadTasks = useCallback(async () => {
    if (!activeWeddingId || !token) return

    setLoading(true)
    setError(null)
    try {
      dispatch(setTasks(await getTasks(activeWeddingId, { token })))
    } catch {
      setError('Nie udało się pobrać zadań z backendu.')
    } finally {
      setLoading(false)
    }
  }, [activeWeddingId, dispatch, token])

  useEffect(() => {
    if (!activeWeddingId || !token) return

    getTasks(activeWeddingId, { token })
      .then(items => {
        dispatch(setTasks(items))
        setError(null)
      })
      .catch(() => setError('Nie udało się pobrać zadań z backendu.'))
      .finally(() => setLoading(false))
  }, [activeWeddingId, dispatch, token])

  const filteredTasks = useMemo(() => tasks.filter(task => {
    const phrase = search.toLowerCase()
    return (task.name.toLowerCase().includes(phrase) || (task.description ?? '').toLowerCase().includes(phrase))
      && (typeFilter === 'ALL' || task.type === typeFilter)
      && (statusFilter === 'ALL' || task.status === statusFilter)
  }), [search, statusFilter, tasks, typeFilter])

  const knownCosts = tasks
    .map(task => task.totalPrice ?? (
      task.pricePerGuest != null && task.numberOfGuests != null
        ? task.pricePerGuest * task.numberOfGuests
        : null
    ))
    .filter(cost => cost !== null)
  const budget = knownCosts.reduce((sum, cost) => sum + cost, 0)
  const pending = tasks.filter(task => task.status === 'PENDING').length
  const inProgress = tasks.filter(task => task.status === 'IN_PROGRESS').length
  const completed = tasks.filter(task => task.status === 'COMPLETED').length

  const openNewTask = () => {
    setSelectedTask(null)
    setTaskForm(emptyForm)
    setShowForm(true)
    setMessage(null)
  }

  const openTask = (task: TaskItem) => {
    setSelectedTask(task)
    setTaskForm({
      type: task.type,
      name: task.name,
      description: task.description ?? '',
      date: task.dueDate?.split('T')[0] ?? '',
      time: task.dueDate?.split('T')[1]?.slice(0, 5) ?? '',
      priority: String(task.priority || 2),
      price: String(task.totalPrice ?? task.pricePerGuest ?? ''),
      numberOfGuests: String(task.numberOfGuests ?? ''),
      detail: task.mealType ?? task.theme ?? task.performerName ?? '',
    })
    setShowForm(true)
    setMessage(null)
  }

  const getRequest = (): TaskRequest => ({
    type: taskForm.type,
    name: taskForm.name.trim(),
    description: taskForm.description.trim(),
    dueDate: taskForm.date ? `${taskForm.date}T${taskForm.time || '00:00'}:00` : null,
    priority: Number(taskForm.priority),
    ...(taskForm.type === 'CATERING'
      ? {
          ...(taskForm.price && { pricePerGuest: Number(taskForm.price) }),
          ...(taskForm.numberOfGuests && { numberOfGuests: Number(taskForm.numberOfGuests) }),
          ...(taskForm.detail.trim() && { mealType: taskForm.detail.trim() }),
        }
      : taskForm.type === 'DECORATION'
        ? {
            ...(taskForm.price && { totalPrice: Number(taskForm.price) }),
            ...(taskForm.detail.trim() && { theme: taskForm.detail.trim() }),
          }
        : {
            ...(taskForm.price && { totalPrice: Number(taskForm.price) }),
            ...(taskForm.detail.trim() && { performerName: taskForm.detail.trim() }),
          }),
  })

  const saveTask = async () => {
    if (!activeWeddingId || !token || !taskForm.name.trim()) {
      setError('Podaj nazwę zadania.')
      return
    }
    if ((taskForm.price && Number(taskForm.price) < 0)
      || (taskForm.type === 'CATERING' && taskForm.numberOfGuests && Number(taskForm.numberOfGuests) < 0)) {
      setError('Cena i liczba gości nie mogą być ujemne.')
      return
    }

    try {
      if (selectedTask) {
        await updateTask(activeWeddingId, selectedTask.id, getRequest(), { token })
        setMessage('Zadanie zostało zaktualizowane.')
      } else {
        await createTask(activeWeddingId, getRequest(), { token })
        setMessage('Zadanie zostało dodane.')
      }
      setShowForm(false)
      setSelectedTask(null)
      await loadTasks()
    } catch {
      setError('Nie udało się zapisać zadania.')
    }
  }

  const changeStatus = async (taskId: number, status: TaskStatus) => {
    if (!activeWeddingId || !token) return
    try {
      await updateTaskStatus(activeWeddingId, taskId, status, { token })
      await loadTasks()
    } catch {
      setError('Nie udało się zmienić statusu zadania.')
    }
  }

  const removeTask = async () => {
    if (!activeWeddingId || !token || !selectedTask || !window.confirm('Czy na pewno chcesz usunąć to zadanie?')) return
    try {
      await deleteTask(activeWeddingId, selectedTask.id, { token })
      setShowForm(false)
      setSelectedTask(null)
      setMessage('Zadanie zostało usunięte.')
      await loadTasks()
    } catch (error) {
      setError(error instanceof Error && error.message.includes('409')
        ? 'Nie można usunąć zadania, ponieważ ma przypisane wydatki.'
        : 'Nie udało się usunąć zadania.')
    }
  }

  if (!activeWeddingId) {
    return <section className='page-card' style={{ padding: '2rem', textAlign: 'center' }}>Wybierz aktywne wydarzenie, aby zobaczyć zadania.</section>
  }

  if (!token) {
    return <section className='page-card' style={{ padding: '2rem', textAlign: 'center' }}>Zadania z backendu są dostępne po zalogowaniu przez Google.</section>
  }

  return (
    <section style={{ display: 'grid', gap: '1rem' }}>
      {message && <div style={{ padding: '1rem', borderRadius: '12px', background: '#daf6e5', color: '#14834b', fontWeight: 600, textAlign: 'center' }}>{message}</div>}
      {error && <div style={{ padding: '1rem', borderRadius: '12px', background: '#fff2f2', color: '#c53030', fontWeight: 600, textAlign: 'center' }}>{error}</div>}

      <article className='page-card' style={{ padding: '1.6rem', background: 'linear-gradient(180deg, #fffdf9 0%, #fff8f1 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <h1 className='page-title' style={{ fontSize: '2rem' }}>Zadania</h1>
            <p className='page-subtitle'>Zadania aktywnego wydarzenia pobrane z backendu.</p>
          </div>
          <button type='button' onClick={openNewTask} className='button-primary'>
            Dodaj nowe zadanie
          </button>
        </div>

        <div style={{ marginTop: '1.2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.85rem' }}>
          <TaskStats title='Wszystkie' value={String(tasks.length)} note='zadań' color='#db7e45' isActive={statusFilter === 'ALL'} onClick={() => setStatusFilter('ALL')} />
          <TaskStats title='Do zrobienia' value={String(pending)} note='zadań' color='#7ea4ff' isActive={statusFilter === 'PENDING'} onClick={() => setStatusFilter('PENDING')} />
          <TaskStats title='W trakcie' value={String(inProgress)} note='zadań' color='#f2a642' isActive={statusFilter === 'IN_PROGRESS'} onClick={() => setStatusFilter('IN_PROGRESS')} />
          <TaskStats title='Zrobione' value={String(completed)} note='zadań' color='#53ba73' isActive={statusFilter === 'COMPLETED'} onClick={() => setStatusFilter('COMPLETED')} />
          <TaskStats title='Budżet zadań' value={knownCosts.length > 0 ? `${budget.toLocaleString('pl-PL')} PLN` : '—'} note='z aktualnych zadań' color='#d6a061' isActive={false} onClick={() => undefined} />
        </div>
      </article>

      <div style={{ display: 'grid', gridTemplateColumns: showForm ? 'minmax(420px, 1.8fr) minmax(320px, 0.95fr)' : '1fr', gap: '1rem', alignItems: 'start' }}>
        <article className='page-card' style={{ padding: 0, overflow: 'hidden' }}>
          <div className='filter-toolbar' style={{ padding: '1rem', borderBottom: '1px solid #f1e8dc' }}>
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder='Szukaj zadania...' className='filter-control' />
            <select value={typeFilter} onChange={event => setTypeFilter(event.target.value)} className='filter-control'>
              <option value='ALL'>Wszystkie typy</option>
              {taskTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className='filter-control'>
              <option value='ALL'>Wszystkie statusy</option>
              {taskStatuses.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
            <button type='button' onClick={() => { setSearch(''); setTypeFilter('ALL'); setStatusFilter('ALL') }} className='button-secondary'>Wyczyść filtry</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 2.2fr) 1fr 0.9fr 0.9fr 0.9fr', gap: '0.9rem', padding: '1rem', background: '#fbf8f3', fontWeight: 700, color: '#6f6559' }}>
            <span>Zadanie</span><span>Typ</span><span>Termin</span><span>Status</span><span>Budżet</span>
          </div>

          {loading && <div style={{ padding: '1.25rem' }}>Ładowanie zadań...</div>}
          {!loading && filteredTasks.map(task => (
            <TaskRow key={task.id} task={task} isSelected={selectedTask?.id === task.id} onSelect={() => openTask(task)} onStatusChange={status => void changeStatus(task.id, status)} />
          ))}
          {!loading && filteredTasks.length === 0 && <div style={{ padding: '1.25rem', color: 'var(--muted)' }}>Brak zadań.</div>}
        </article>

        {showForm && (
          <div style={{ position: 'sticky', top: '1rem' }}>
            <TaskForm
              values={taskForm}
              editing={Boolean(selectedTask)}
              onChange={(field, value) => setTaskForm(current => ({ ...current, [field]: value }))}
              onCancel={() => { setShowForm(false); setSelectedTask(null) }}
              onSubmit={() => void saveTask()}
              onDelete={selectedTask ? () => void removeTask() : undefined}
            />
          </div>
        )}
      </div>
    </section>
  )
}
