import type {
  TaskCategory,
  TaskPriority,
  TaskStatus,
} from '../data/tasksMock'

export type TaskFormState = {
  name: string
  category: TaskCategory | ''
  description: string
  date: string
  time: string
  budget: string
  priority: TaskPriority
  assignee: string
  status: TaskStatus
}

type TaskFormProps = {
  values: TaskFormState
  onChange: (field: keyof TaskFormState, value: string) => void
  onStatusChange: (value: TaskStatus) => void
  onCancel: () => void
  onSubmit: () => void
}

export function TaskForm({
  values,
  onChange,
  onStatusChange,
  onCancel,
  onSubmit,
}: TaskFormProps) {
  return (
    <article className='page-card' style={{ padding: 0, overflow: 'hidden' }}>
      <div
        style={{
          padding: '1.2rem 1.35rem',
          borderBottom: '1px solid #f1e8dc',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Dodaj nowe zadanie</h2>
        <button
          type='button'
          onClick={onCancel}
          style={{
            border: 'none',
            background: 'transparent',
            color: 'var(--muted)',
            cursor: 'pointer',
            fontSize: '1.2rem',
          }}
        >
          x
        </button>
      </div>

      <div style={{ padding: '1.25rem', display: 'grid', gap: '1rem' }}>
        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>Nazwa zadania</span>
          <input
            value={values.name}
            onChange={(event) => onChange('name', event.target.value)}
            placeholder='Wpisz nazwe zadania'
            style={{
              minHeight: '48px',
              borderRadius: '12px',
              border: '1px solid #efe4d7',
              background: '#fffdfa',
              padding: '0 1rem',
            }}
          />
        </label>

        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>Kategoria</span>
          <select
            value={values.category}
            onChange={(event) => onChange('category', event.target.value)}
            style={{
              minHeight: '48px',
              borderRadius: '12px',
              border: '1px solid #efe4d7',
              background: '#fffdfa',
              padding: '0 1rem',
            }}
          >
            <option value=''>Wybierz kategorie</option>
            <option value='Catering'>Catering</option>
            <option value='Dekoracje'>Dekoracje</option>
            <option value='Fotografia'>Fotografia</option>
            <option value='Muzyka'>Muzyka</option>
            <option value='Wydarzenie'>Wydarzenie</option>
          </select>
        </label>

        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>Opis</span>
          <textarea
            value={values.description}
            onChange={(event) => onChange('description', event.target.value)}
            placeholder='Dodaj opis zadania'
            style={{
              minHeight: '110px',
              borderRadius: '14px',
              border: '1px solid #efe4d7',
              background: '#fffdfa',
              padding: '0.9rem 1rem',
              resize: 'vertical',
            }}
          />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          <label style={{ display: 'grid', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>Data</span>
            <input
              type='date'
              value={values.date}
              onChange={(event) => onChange('date', event.target.value)}
              style={{
                minHeight: '48px',
                borderRadius: '12px',
                border: '1px solid #efe4d7',
                background: '#fffdfa',
                padding: '0 1rem',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>Godzina</span>
            <input
              type='time'
              value={values.time}
              onChange={(event) => onChange('time', event.target.value)}
              style={{
                minHeight: '48px',
                borderRadius: '12px',
                border: '1px solid #efe4d7',
                background: '#fffdfa',
                padding: '0 1rem',
              }}
            />
          </label>
        </div>

        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>Budzet</span>
          <input
            type='number'
            value={values.budget}
            onChange={(event) => onChange('budget', event.target.value)}
            placeholder='0'
            style={{
              minHeight: '48px',
              borderRadius: '12px',
              border: '1px solid #efe4d7',
              background: '#fffdfa',
              padding: '0 1rem',
            }}
          />
        </label>

        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>Priorytet</span>
          <select
            value={values.priority}
            onChange={(event) => onChange('priority', event.target.value)}
            style={{
              minHeight: '48px',
              borderRadius: '12px',
              border: '1px solid #efe4d7',
              background: '#fffdfa',
              padding: '0 1rem',
            }}
          >
            <option value='Wysoki'>Wysoki</option>
            <option value='Sredni'>Sredni</option>
            <option value='Niski'>Niski</option>
          </select>
        </label>

        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>Przypisane do</span>
          <select
            value={values.assignee}
            onChange={(event) => onChange('assignee', event.target.value)}
            style={{
              minHeight: '48px',
              borderRadius: '12px',
              border: '1px solid #efe4d7',
              background: '#fffdfa',
              padding: '0 1rem',
            }}
          >
            <option value=''>Wybierz osobe</option>
            <option value='Anna Kowalska'>Anna Kowalska</option>
            <option value='Maria Nowak'>Maria Nowak</option>
            <option value='Jakub Zielinski'>Jakub Zielinski</option>
          </select>
        </label>

        <div style={{ display: 'grid', gap: '0.65rem' }}>
          <span style={{ fontWeight: 600 }}>Status</span>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {(['Do zrobienia', 'W trakcie', 'Zrobione'] as TaskStatus[]).map((status) => (
              <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}>
                <input
                  type='radio'
                  name='task-status'
                  checked={values.status === status}
                  onChange={() => onStatusChange(status)}
                  style={{ accentColor: '#d67c3a' }}
                />
                <span>{status}</span>
              </label>
            ))}
          </div>
        </div>

        <div
          style={{
            border: '1px solid #f2d9bd',
            borderRadius: '14px',
            background: '#fff9f1',
            padding: '0.9rem 1rem',
            color: '#8f6f45',
          }}
        >
          Zadanie zostanie dodane tylko do tej listy. To nadal jest lokalny mockup UI.
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.8rem', marginTop: '0.35rem' }}>
          <button
            type='button'
            onClick={onCancel}
            style={{
              flex: 1,
              minHeight: '48px',
              borderRadius: '14px',
              border: '1px solid #efe1d0',
              background: '#fffdfa',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Anuluj
          </button>
          <button
            type='button'
            onClick={onSubmit}
            style={{
              flex: 1,
              minHeight: '48px',
              borderRadius: '14px',
              border: '1px solid transparent',
              background: '#d67c3a',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Dodaj zadanie
          </button>
        </div>
      </div>
    </article>
  )
}
