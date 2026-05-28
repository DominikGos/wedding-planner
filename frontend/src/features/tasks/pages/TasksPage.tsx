import { useMemo, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import type { RootState } from '../../../store'
import { addTask, updateTaskStatus, toggleTaskChecked, editTask } from '../../../store/slices/tasksSlice'

import { TaskForm, type TaskFormState } from '../components/TaskForm'
import { TaskRow } from '../components/TaskRow'
import { TaskStats } from '../components/TaskStats'
import {
  assigneeOptions,
  categoryOptions,
  plannedBudget,
  statusOptions,
  type TaskItem,
  type TaskStatus,
} from '../data/tasksMock'

export function TasksPage() {
  const dispatch = useDispatch()
  const location = useLocation()
  const listState = useSelector((state: RootState) => state.tasks.items)

  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [selectedStat, setSelectedStat] = useState('all')
  const [editingMode, setEditingMode] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [tasksNotification, setTasksNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setTasksNotification({ text, type })
    setTimeout(() => {
      setTasksNotification(null)
    }, 4500)
  }
  
  const [formState, setFormState] = useState({
    search: '',
    category: 'Wszystkie kategorie',
    status: 'Wszystkie statusy',
  })

  const [taskForm, setTaskForm] = useState<TaskFormState>({
    name: '',
    category: '',
    description: '',
    date: '',
    time: '',
    budget: '',
    priority: 'Sredni',
    assignee: '',
    status: 'Do zrobienia',
    scheduleType: '',
  })

  const scrollToForm = () => {
    setTimeout(() => {
      const container = document.getElementById('task-form-container')
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 150)
  }

  // Detect location state to auto-open form on mount
  useEffect(() => {
    if (location?.state?.openForm) {
      setShowForm(true)
      resetTaskForm()
      scrollToForm()
    }
  }, [location?.state])

  // Load selected task details into form when clicked for editing
  const selectedTask = useMemo(() => {
    return listState.find(t => t.id === selectedItem)
  }, [selectedItem, listState])

  useEffect(() => {
    if (selectedTask) {
      setTaskForm({
        name: selectedTask.name,
        category: selectedTask.category,
        description: selectedTask.description,
        date: selectedTask.date,
        time: selectedTask.time,
        budget: String(selectedTask.budget),
        priority: selectedTask.priority,
        assignee: selectedTask.assignee,
        status: selectedTask.status,
        scheduleType: selectedTask.scheduleType || '',
      })
      setEditingMode(true)
      setShowForm(true)
      scrollToForm()
    }
  }, [selectedTask])

  const filteredTasks = useMemo(() => {
    return listState.filter((task) => {
      const matchesSearch =
        task.name.toLowerCase().includes(formState.search.toLowerCase()) ||
        task.description.toLowerCase().includes(formState.search.toLowerCase())
      const matchesCategory =
        formState.category === 'Wszystkie kategorie' || task.category === formState.category
      const matchesStatus =
        formState.status === 'Wszystkie statusy' || task.status === formState.status
      const matchesSummary =
        selectedStat === 'all' ||
        (selectedStat === 'budget' ? true : task.status === selectedStat)

      return matchesSearch && matchesCategory && matchesStatus && matchesSummary
    })
  }, [formState.category, formState.search, formState.status, listState, selectedStat])

  const doneTasks = listState.filter((task) => task.status === 'Zrobione').length
  const inProgressTasks = listState.filter((task) => task.status === 'W trakcie').length
  const todoTasks = listState.filter((task) => task.status === 'Do zrobienia').length
  const spentBudget = useMemo(() => listState.reduce((total, task) => total + task.budget, 0), [listState])
  const remainingBudget = plannedBudget - spentBudget

  const toggleTask = (taskId: string) => {
    dispatch(toggleTaskChecked(taskId))
  }

  const resetTaskForm = () => {
    setEditingMode(false)
    setSelectedItem(null)
    setTaskForm({
      name: '',
      category: '',
      description: '',
      date: '',
      time: '',
      budget: '',
      priority: 'Sredni',
      assignee: '',
      status: 'Do zrobienia',
      scheduleType: '',
    })
  }

  const handleOpenNewForm = () => {
    resetTaskForm()
    setShowForm(true)
    scrollToForm()
  }

  const handleCancelForm = () => {
    resetTaskForm()
    setShowForm(false)
  }

  const handleAddTask = () => {
    if (!taskForm.name.trim() || !taskForm.category || !taskForm.date) {
      showNotification('Proszę wypełnić wymagane pola: Nazwa, Kategoria oraz Data!', 'error')
      return
    }

    if (editingMode && selectedItem) {
      // Edit mode
      const updatedTask: TaskItem = {
        id: selectedItem,
        name: taskForm.name,
        description: taskForm.description || 'Nowe zadanie organizacyjne',
        category: taskForm.category || 'Wydarzenie',
        date: taskForm.date,
        time: taskForm.time || '12:00',
        status: taskForm.status,
        budget: Number(taskForm.budget) || 0,
        priority: taskForm.priority,
        assignee: taskForm.assignee || assigneeOptions[0],
        checked: selectedTask?.checked || false,
        color: selectedTask?.color || '#ff9aaa',
        scheduleType: taskForm.scheduleType || undefined,
      }
      dispatch(editTask(updatedTask))
      showNotification('Pomyślnie zaktualizowano zadanie!', 'success')
    } else {
      // Add mode
      const newTask: TaskItem = {
        id: `task-${Date.now()}`,
        name: taskForm.name,
        description: taskForm.description || 'Nowe zadanie organizacyjne',
        category: taskForm.category || 'Wydarzenie',
        date: taskForm.date,
        time: taskForm.time || '12:00',
        status: taskForm.status,
        budget: Number(taskForm.budget) || 0,
        priority: taskForm.priority,
        assignee: taskForm.assignee || assigneeOptions[0],
        checked: false,
        color:
          taskForm.category === 'Catering'
            ? '#b57be8'
            : taskForm.category === 'Dekoracje'
              ? '#58c983'
              : taskForm.category === 'Fotografia'
                ? '#ff8ba0'
                : taskForm.category === 'Muzyka'
                  ? '#ffad63'
                  : '#ff9aaa',
        scheduleType: taskForm.scheduleType || undefined,
      }

      dispatch(addTask(newTask))
      setSelectedItem(newTask.id)
      showNotification('Dodano nowe zadanie do planera!', 'success')
    }
    resetTaskForm()
    setShowForm(false)
  }

  return (
    <section style={{ display: 'grid', gap: '1rem' }}>
      {tasksNotification && (
        <div style={{
          padding: '1rem',
          borderRadius: '12px',
          background: tasksNotification.type === 'success' ? '#daf6e5' : '#fff2f2',
          color: tasksNotification.type === 'success' ? '#14834b' : '#c53030',
          border: `1px solid ${tasksNotification.type === 'success' ? '#bfeecf' : '#f4c1c1'}`,
          fontWeight: 600,
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease'
        }}>
          {tasksNotification.text}
        </div>
      )}

      <article
        className='page-card'
        style={{
          padding: '1.6rem',
          background: 'linear-gradient(180deg, #fffdf9 0%, #fff8f1 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1 className='page-title' style={{ fontSize: '2rem' }}>
              Zadania
            </h1>
            <p className='page-subtitle' style={{ fontSize: '1.05rem' }}>
              Zarządzaj wszystkimi zadaniami związanymi z organizacją ślubu.
            </p>
          </div>

          <button
            type='button'
            onClick={handleOpenNewForm}
            disabled={showForm}
            style={{
              padding: '0.9rem 1.25rem',
              borderRadius: '14px',
              background: showForm ? '#e5d7c3' : '#d67c3a',
              color: showForm ? 'var(--muted)' : '#fff',
              border: '1px solid transparent',
              fontWeight: 700,
              cursor: showForm ? 'not-allowed' : 'pointer',
              boxShadow: showForm ? 'none' : '0 10px 24px rgba(214, 124, 58, 0.24)',
              opacity: showForm ? 0.75 : 1,
              transition: 'all 0.25s'
            }}
          >
            + Dodaj nowe zadanie
          </button>
        </div>

        <div
          style={{
            marginTop: '1.2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '0.85rem',
          }}
        >
          <TaskStats
            title='Wszystkie'
            value={String(listState.length)}
            note='zadań'
            color='#db7e45'
            isActive={selectedStat === 'all'}
            onClick={() => {
              setSelectedStat('all')
              setFormState(c => ({ ...c, status: 'Wszystkie statusy' }))
            }}
          />
          <TaskStats
            title='Do zrobienia'
            value={String(todoTasks)}
            note='zadań'
            color='#7ea4ff'
            isActive={selectedStat === 'Do zrobienia'}
            onClick={() => {
              setSelectedStat('Do zrobienia')
              setFormState(c => ({ ...c, status: 'Do zrobienia' }))
            }}
          />
          <TaskStats
            title='W trakcie'
            value={String(inProgressTasks)}
            note='zadań'
            color='#f2a642'
            isActive={selectedStat === 'W trakcie'}
            onClick={() => {
              setSelectedStat('W trakcie')
              setFormState(c => ({ ...c, status: 'W trakcie' }))
            }}
          />
          <TaskStats
            title='Zrobione'
            value={String(doneTasks)}
            note='zadań'
            color='#53ba73'
            isActive={selectedStat === 'Zrobione'}
            onClick={() => {
              setSelectedStat('Zrobione')
              setFormState(c => ({ ...c, status: 'Zrobione' }))
            }}
          />
          <TaskStats
            title='Budżet zadań'
            value={`${spentBudget.toLocaleString('pl-PL')} PLN`}
            note={`plan: ${plannedBudget.toLocaleString('pl-PL')} PLN`}
            color='#d6a061'
            isActive={selectedStat === 'budget'}
            onClick={() => {
              setSelectedStat('budget')
              setFormState(c => ({ ...c, status: 'Wszystkie statusy' }))
            }}
          />
        </div>
      </article>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: showForm ? 'minmax(320px, 1.8fr) minmax(320px, 0.95fr)' : '1fr',
          gap: '1rem',
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'grid', gap: '1rem' }}>
          <article className='page-card' style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{
                padding: '1rem',
                borderBottom: '1px solid #f1e8dc',
                display: 'grid',
                gridTemplateColumns: 'minmax(180px, 1.4fr) repeat(3, minmax(140px, 1fr))',
                gap: '0.8rem',
              }}
            >
              <input
                value={formState.search}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    search: event.target.value,
                  }))
                }
                placeholder='Szukaj zadania...'
                style={{
                  minHeight: '46px',
                  borderRadius: '12px',
                  border: '1px solid #efe4d7',
                  background: '#fffdfa',
                  padding: '0 1rem',
                }}
              />

              <select
                value={formState.category}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
                style={{
                  minHeight: '46px',
                  borderRadius: '12px',
                  border: '1px solid #efe4d7',
                  background: '#fffdfa',
                  padding: '0 1rem',
                }}
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <select
                value={formState.status}
                onChange={(event) => {
                  const val = event.target.value
                  setFormState((current) => ({
                    ...current,
                    status: val,
                  }))
                  if (val === 'Wszystkie statusy') {
                    setSelectedStat('all')
                  } else {
                    setSelectedStat(val)
                  }
                }}
                style={{
                  minHeight: '46px',
                  borderRadius: '12px',
                  border: '1px solid #efe4d7',
                  background: '#fffdfa',
                  padding: '0 1rem',
                }}
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <button
                type='button'
                onClick={() => {
                  setFormState({
                    search: '',
                    category: 'Wszystkie kategorie',
                    status: 'Wszystkie statusy',
                  })
                  setSelectedStat('all')
                }}
                style={{
                  minHeight: '46px',
                  borderRadius: '12px',
                  border: '1px solid #f0d8c1',
                  background: '#fff8f1',
                  color: '#db7e45',
                  padding: '0 1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Wyczyść filtry
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '34px minmax(220px, 2.2fr) 1fr 0.9fr 0.9fr 0.9fr',
                gap: '0.9rem',
                padding: '1rem',
                background: '#fbf8f3',
                fontWeight: 700,
                color: '#6f6559',
              }}
            >
              <span />
              <span>Zadanie</span>
              <span>Kategoria</span>
              <span>Termin</span>
              <span>Status</span>
              <span>Budżet</span>
            </div>

            <div>
              {filteredTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isSelected={selectedItem === task.id}
                  onSelect={() => {
                    setSelectedItem(task.id)
                    setShowForm(true)
                    console.log('task:select', task.id)
                  }}
                  onToggle={() => {
                    toggleTask(task.id)
                    console.log('task:toggle', task.id)
                  }}
                  onStatusChange={(newStatus) => {
                    dispatch(updateTaskStatus({ id: task.id, status: newStatus }))
                  }}
                />
              ))}

              {filteredTasks.length === 0 ? (
                <div style={{ padding: '1.25rem 1rem', color: 'var(--muted)' }}>
                  Brak zadań dla wybranych filtrów.
                </div>
              ) : null}
            </div>
          </article>

          <article className='page-card' style={{ padding: '1.25rem' }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Podsumowanie budżetu zadań</h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.3fr 1fr',
                gap: '1.2rem',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                  <span>Planowany budżet zadań</span>
                  <strong>{plannedBudget.toLocaleString('pl-PL')} PLN</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                  <span>Bieżące wydatki</span>
                  <strong>{spentBudget.toLocaleString('pl-PL')} PLN</strong>
                </div>
                <div
                  style={{
                    height: '8px',
                    borderRadius: '999px',
                    background: '#f3e6d8',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min((spentBudget / plannedBudget) * 100, 100)}%`,
                      height: '100%',
                      borderRadius: '999px',
                      background: 'linear-gradient(90deg, #f2b45e 0%, #db7e45 100%)',
                    }}
                  />
                </div>
              </div>

              <div>
                <span style={{ display: 'block', color: 'var(--muted)' }}>Pozostało</span>
                <strong style={{ display: 'block', marginTop: '0.35rem', fontSize: '2rem', color: '#34a853' }}>
                  {remainingBudget.toLocaleString('pl-PL')} PLN
                </strong>
              </div>
            </div>
          </article>
        </div>

        {showForm && (
          <div id='task-form-container' style={{ position: 'sticky', top: '1rem' }}>
            <TaskForm
              values={taskForm}
              onChange={(field, value) =>
                setTaskForm((current) => ({
                  ...current,
                  [field]: value,
                }))
              }
              onStatusChange={(value: TaskStatus) =>
                setTaskForm((current) => ({
                  ...current,
                  status: value,
                }))
              }
              onCancel={handleCancelForm}
              onSubmit={handleAddTask}
            />
            
            {editingMode && (
              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <button 
                  onClick={resetTaskForm}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--muted)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Przestań edytować i stwórz nowe zadanie
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
