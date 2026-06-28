import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
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
  paymentMethod: 'ONLINE',
}

export function TasksPage() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const tasks = useSelector((state: RootState) => state.tasks.items)
  const { activeWeddingId, token, user } = useSelector((state: RootState) => state.auth)

  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [taskForm, setTaskForm] = useState<TaskFormState>(emptyForm)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(Boolean(activeWeddingId && token))
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const formPanelRef = useRef<HTMLDivElement>(null)

  const loadTasks = useCallback(async () => {
    if (!activeWeddingId || !token) return

    setLoading(true)
    setError(null)
    try {
      dispatch(setTasks(await getTasks(activeWeddingId, { token })))
    } catch {
      setError(t('tasks.loadError'))
    } finally {
      setLoading(false)
    }
  }, [activeWeddingId, dispatch, token, t])

  useEffect(() => {
    if (!activeWeddingId || !token) return

    getTasks(activeWeddingId, { token })
      .then(items => {
        dispatch(setTasks(items))
        setError(null)
      })
      .catch(() => setError(t('tasks.loadError')))
      .finally(() => setLoading(false))
  }, [activeWeddingId, dispatch, token, t])

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
    setError(null)
    window.setTimeout(() => {
      formPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
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
      paymentMethod: task.paymentMethod ?? 'ONLINE',
    })
    setShowForm(true)
    setMessage(null)
    setError(null)
    window.setTimeout(() => {
      formPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
  }

  const getRequest = (): TaskRequest => ({
    type: taskForm.type,
    name: taskForm.name.trim(),
    description: taskForm.description.trim(),
    dueDate: taskForm.date ? `${taskForm.date}T${taskForm.time || '00:00'}:00` : null,
    priority: Number(taskForm.priority),
    paymentMethod: taskForm.paymentMethod || 'ONLINE',
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
    if (selectedTask?.lockedByPayment) {
      setError(t('tasks.paymentLockedError'))
      return
    }
    if (!activeWeddingId || !token || !taskForm.name.trim()) {
      setError(t('tasks.nameRequired'))
      return
    }
    if ((taskForm.price && Number(taskForm.price) < 0)
      || (taskForm.type === 'CATERING' && taskForm.numberOfGuests && Number(taskForm.numberOfGuests) < 0)) {
      setError(t('tasks.negativeValues'))
      return
    }

    try {
      if (selectedTask) {
        const updatedTask = await updateTask(activeWeddingId, selectedTask.id, getRequest(), { token })
        dispatch(setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task)))
        setMessage(t('tasks.saved'))
      } else {
        const createdTask = await createTask(activeWeddingId, getRequest(), { token })
        dispatch(setTasks([...tasks, createdTask]))
        setMessage(t('tasks.added'))
      }
      setShowForm(false)
      setSelectedTask(null)
      await loadTasks()
    } catch (error) {
      setError(error instanceof Error && error.message.includes('409')
        ? t('tasks.paymentLockedError')
        : t('tasks.saveError'))
    }
  }

  const changeStatus = async (taskId: number, status: TaskStatus) => {
    if (!activeWeddingId || !token) return
    if (tasks.find(task => task.id === taskId)?.lockedByPayment) {
      setError(t('tasks.paymentLockedError'))
      return
    }
    try {
      await updateTaskStatus(activeWeddingId, taskId, status, { token })
      window.dispatchEvent(new Event('notifications:refresh'))
      await loadTasks()
    } catch (error) {
      setError(error instanceof Error && error.message.includes('409')
        ? t('tasks.paymentLockedError')
        : t('tasks.statusError'))
    }
  }

  const removeTask = async () => {
    if (!activeWeddingId || !token || !selectedTask || !window.confirm(t('tasks.deleteConfirm'))) return
    try {
      await deleteTask(activeWeddingId, selectedTask.id, { token })
      setShowForm(false)
      setSelectedTask(null)
      setMessage(t('tasks.deleted'))
      await loadTasks()
    } catch (error) {
      setError(error instanceof Error && error.message.includes('409')
        ? t('tasks.deleteError409')
        : t('tasks.deleteError'))
    }
  }

  if (!activeWeddingId) {
    return <section className='page-card' style={{ padding: '2rem', textAlign: 'center' }}>{t('tasks.noActiveEvent')}</section>
  }

  if (!token) {
    return <section className='page-card' style={{ padding: '2rem', textAlign: 'center' }}>{t('tasks.requiresLogin')}</section>
  }

  return (
    <section style={{ display: 'grid', gap: '1rem' }}>
      {message && <div style={{ padding: '1rem', borderRadius: '12px', background: '#daf6e5', color: '#14834b', fontWeight: 600, textAlign: 'center' }}>{message}</div>}
      {error && !showForm && <div className='app-alert app-alert-danger' style={{ textAlign: 'center' }}>{error}</div>}

      <article className='page-card' style={{ padding: '1.6rem', background: 'linear-gradient(180deg, var(--surface) 0%, var(--surface-soft) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <h1 className='page-title' style={{ fontSize: '2rem' }}>{t('tasks.pageTitle')}</h1>
            <p className='page-subtitle'>{t('tasks.pageSubtitle')}</p>
          </div>
          <button type='button' onClick={openNewTask} className='button-primary'>
            {t('tasks.addNew')}
          </button>
        </div>

        <div className="mobile-stat-grid" style={{ marginTop: '1.2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.85rem' }}>
          <TaskStats title={t('tasks.statAll')} value={String(tasks.length)} note={t('tasks.statNote')} color='#db7e45' isActive={statusFilter === 'ALL'} onClick={() => setStatusFilter('ALL')} />
          <TaskStats title={t('tasks.statPending')} value={String(pending)} note={t('tasks.statNote')} color='#7ea4ff' isActive={statusFilter === 'PENDING'} onClick={() => setStatusFilter('PENDING')} />
          <TaskStats title={t('tasks.statInProgress')} value={String(inProgress)} note={t('tasks.statNote')} color='#f2a642' isActive={statusFilter === 'IN_PROGRESS'} onClick={() => setStatusFilter('IN_PROGRESS')} />
          <TaskStats title={t('tasks.statDone')} value={String(completed)} note={t('tasks.statNote')} color='#53ba73' isActive={statusFilter === 'COMPLETED'} onClick={() => setStatusFilter('COMPLETED')} />
          <TaskStats title={t('tasks.statBudget')} value={knownCosts.length > 0 ? `${budget.toLocaleString('pl-PL')} PLN` : '—'} note={t('tasks.statBudgetNote')} color='var(--primary)' isActive={false} onClick={() => undefined} />
        </div>
      </article>

      <div className="tasks-layout" style={{ display: 'grid', gridTemplateColumns: showForm ? 'minmax(420px, 1.8fr) minmax(320px, 0.95fr)' : '1fr', gap: '1rem', alignItems: 'start' }}>
        <article className='page-card' style={{ padding: 0, overflow: 'hidden' }}>
          <div className='filter-toolbar' style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder={t('tasks.searchPlaceholder')} className='filter-control' />
            <select value={typeFilter} onChange={event => setTypeFilter(event.target.value)} className='filter-control'>
              <option value='ALL'>{t('tasks.allTypes')}</option>
              {taskTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {t(`tasks.types.${type.value}`)}
                </option>
              ))}
            </select>
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className='filter-control'>
              <option value='ALL'>{t('tasks.allStatuses')}</option>
              {taskStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {t(`tasks.statuses.${status.value}`)}
                </option>
              ))}
            </select>
            <button type='button' onClick={() => { setSearch(''); setTypeFilter('ALL'); setStatusFilter('ALL') }} className='button-secondary'>{t('tasks.clearFilters')}</button>
          </div>

          <div className="tasks-table-header" style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 2.2fr) 1fr 0.9fr 0.9fr 0.9fr', gap: '0.9rem', padding: '1rem', background: 'var(--surface-soft)', fontWeight: 700, color: 'var(--muted)' }}>
            <span>{t('tasks.colTask')}</span><span>{t('tasks.colType')}</span><span>{t('tasks.colDeadline')}</span><span>{t('tasks.colStatus')}</span><span>{t('tasks.colBudget')}</span>
          </div>

          {loading && <div style={{ padding: '1.25rem' }}>{t('tasks.loadingTasks')}</div>}
          {!loading && filteredTasks.map(task => (
            <TaskRow key={task.id} task={task} isSelected={selectedTask?.id === task.id} onSelect={() => openTask(task)} onStatusChange={status => void changeStatus(task.id, status)} />
          ))}
          {!loading && filteredTasks.length === 0 && <div style={{ padding: '1.25rem', color: 'var(--muted)' }}>{t('tasks.noTasks')}</div>}
        </article>

        {showForm && (
          <div ref={formPanelRef} className="tasks-form-panel" style={{ position: 'sticky', top: '1rem' }}>
            <TaskForm
              values={taskForm}
              editing={Boolean(selectedTask)}
              error={error}
              onChange={(field, value) => {
                setError(null)
                setTaskForm(current => ({ ...current, [field]: value }))
              }}
              onCancel={() => { setShowForm(false); setSelectedTask(null); setError(null) }}
              onSubmit={() => void saveTask()}
              onDelete={selectedTask ? () => void removeTask() : undefined}
              canEditPaymentMethod={user?.role === 'couple'}
              readOnly={Boolean(selectedTask?.lockedByPayment)}
            />
          </div>
        )}
      </div>
    </section>
  )
}
