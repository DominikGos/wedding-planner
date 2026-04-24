import { useMemo, useState } from 'react'
import { TaskForm, type TaskFormState } from '../components/TaskForm'
import { TaskRow } from '../components/TaskRow'
import { TaskStats } from '../components/TaskStats'
import {
  assigneeOptions,
  categoryOptions,
  initialTasks,
  plannedBudget,
  statusOptions,
  type TaskItem,
  type TaskStatus,
} from '../data/tasksMock'

export function TasksPage() {
  const [listState, setListState] = useState(initialTasks)
  const [selectedItem, setSelectedItem] = useState(initialTasks[0].id)
  const [selectedStat, setSelectedStat] = useState('all')
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
  })

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
    setListState((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, checked: !task.checked } : task,
      ),
    )
  }

  const resetTaskForm = () => {
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
    })
  }

  const handleAddTask = () => {
    if (!taskForm.name.trim() || !taskForm.category || !taskForm.date) {
      console.log('task:add:missing-fields')
      return
    }

    const newTask: TaskItem = {
      id: `task-${listState.length + 1}`,
      name: taskForm.name,
      description: taskForm.description || 'Nowe zadanie organizacyjne',
      category: taskForm.category,
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
    }

    setListState((current) => [newTask, ...current])
    setSelectedItem(newTask.id)
    console.log('task:add', newTask)
    resetTaskForm()
  }

  return (
    <section style={{ display: 'grid', gap: '1rem' }}>
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
              Zarzadzaj wszystkimi zadaniami zwiazanymi z organizacja slubu.
            </p>
          </div>

          <button
            type='button'
            onClick={() => console.log('tasks:open-form')}
            style={{
              padding: '0.9rem 1.25rem',
              borderRadius: '14px',
              background: '#d67c3a',
              color: '#fff',
              border: '1px solid transparent',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 10px 24px rgba(214, 124, 58, 0.24)',
            }}
          >
            + Dodaj zadanie
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
            note='zadan'
            color='#db7e45'
            isActive={selectedStat === 'all'}
            onClick={() => setSelectedStat('all')}
          />
          <TaskStats
            title='Do zrobienia'
            value={String(todoTasks)}
            note='zadan'
            color='#7ea4ff'
            isActive={selectedStat === 'Do zrobienia'}
            onClick={() => setSelectedStat('Do zrobienia')}
          />
          <TaskStats
            title='W trakcie'
            value={String(inProgressTasks)}
            note='zadan'
            color='#f2a642'
            isActive={selectedStat === 'W trakcie'}
            onClick={() => setSelectedStat('W trakcie')}
          />
          <TaskStats
            title='Zrobione'
            value={String(doneTasks)}
            note='zadan'
            color='#53ba73'
            isActive={selectedStat === 'Zrobione'}
            onClick={() => setSelectedStat('Zrobione')}
          />
          <TaskStats
            title='Budzet zadan'
            value={`${spentBudget.toLocaleString('pl-PL')} PLN`}
            note={`plan: ${plannedBudget.toLocaleString('pl-PL')} PLN`}
            color='#d6a061'
            isActive={selectedStat === 'budget'}
            onClick={() => setSelectedStat('budget')}
          />
        </div>
      </article>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.8fr) minmax(320px, 0.95fr)',
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
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    status: event.target.value,
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
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <button
                type='button'
                onClick={() =>
                  setFormState({
                    search: '',
                    category: 'Wszystkie kategorie',
                    status: 'Wszystkie statusy',
                  })
                }
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
                Filtry
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
              <span>Budzet</span>
            </div>

            <div>
              {filteredTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isSelected={selectedItem === task.id}
                  onSelect={() => {
                    setSelectedItem(task.id)
                    console.log('task:select', task.id)
                  }}
                  onToggle={() => {
                    toggleTask(task.id)
                    console.log('task:toggle', task.id)
                  }}
                />
              ))}

              {filteredTasks.length === 0 ? (
                <div style={{ padding: '1.25rem 1rem', color: 'var(--muted)' }}>
                  Brak zadan dla wybranych filtrow.
                </div>
              ) : null}
            </div>
          </article>

          <article className='page-card' style={{ padding: '1.25rem' }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Podsumowanie budzetu zadan</h2>

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
                  <span>Planowany budzet zadan</span>
                  <strong>{plannedBudget.toLocaleString('pl-PL')} PLN</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                  <span>Biezace wydatki</span>
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
                <span style={{ display: 'block', color: 'var(--muted)' }}>Pozostalo</span>
                <strong style={{ display: 'block', marginTop: '0.35rem', fontSize: '2rem', color: '#34a853' }}>
                  {remainingBudget.toLocaleString('pl-PL')} PLN
                </strong>
              </div>
            </div>
          </article>
        </div>

        <div style={{ position: 'sticky', top: '1rem' }}>
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
            onCancel={() => {
              resetTaskForm()
              console.log('task:cancel')
            }}
            onSubmit={handleAddTask}
          />
        </div>
      </div>
    </section>
  )
}
