import type { TaskType } from '../../../api/taskApi'
import { taskTypes } from '../data/tasksMock'

export type TaskFormState = {
  type: TaskType
  name: string
  description: string
  date: string
  time: string
  priority: string
  price: string
  numberOfGuests: string
  detail: string
}

type TaskFormProps = {
  values: TaskFormState
  editing: boolean
  onChange: (field: keyof TaskFormState, value: string) => void
  onCancel: () => void
  onSubmit: () => void
  onDelete?: () => void
}

export function TaskForm({ values, editing, onChange, onCancel, onSubmit, onDelete }: TaskFormProps) {
  const cateringCost = values.price && values.numberOfGuests
    ? Number(values.price) * Number(values.numberOfGuests)
    : null

  const inputStyle = {
    minHeight: '48px',
    borderRadius: '12px',
    border: '1px solid #efe4d7',
    background: '#fffdfa',
    padding: '0 1rem',
  }

  return (
    <article className='page-card' style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '1.2rem 1.35rem', borderBottom: '1px solid #f1e8dc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{editing ? 'Edytuj zadanie' : 'Dodaj nowe zadanie'}</h2>
        <button type='button' onClick={onCancel} style={{ border: 'none', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.2rem' }}>x</button>
      </div>

      <div style={{ padding: '1.25rem', display: 'grid', gap: '1rem' }}>
        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>Nazwa zadania</span>
          <input value={values.name} onChange={event => onChange('name', event.target.value)} style={inputStyle} />
        </label>

        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>Typ</span>
          <select value={values.type} disabled={editing} onChange={event => onChange('type', event.target.value)} style={inputStyle}>
            {taskTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
        </label>

        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>Opis</span>
          <textarea value={values.description} onChange={event => onChange('description', event.target.value)} style={{ ...inputStyle, minHeight: '100px', padding: '0.9rem 1rem', resize: 'vertical' }} />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          <label style={{ display: 'grid', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>Data</span>
            <input type='date' value={values.date} onChange={event => onChange('date', event.target.value)} style={inputStyle} />
          </label>
          <label style={{ display: 'grid', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>Godzina</span>
            <input type='time' value={values.time} onChange={event => onChange('time', event.target.value)} style={inputStyle} />
          </label>
        </div>

        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>Priorytet</span>
          <select value={values.priority} onChange={event => onChange('priority', event.target.value)} style={inputStyle}>
            <option value='1'>Niski</option>
            <option value='2'>Średni</option>
            <option value='3'>Wysoki</option>
          </select>
        </label>

        <div style={{ borderTop: '1px solid #f1e8dc', paddingTop: '1rem' }}>
          <strong>Szczegóły i koszt kategorii</strong>
          <span style={{ marginLeft: '0.5rem', color: 'var(--muted)', fontSize: '0.85rem' }}>Opcjonalne</span>
        </div>

        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>{values.type === 'CATERING' ? 'Cena za osobę' : 'Szacowany koszt całkowity'}</span>
          <input type='number' min='0' value={values.price} onChange={event => onChange('price', event.target.value)} style={inputStyle} />
        </label>

        {values.type === 'CATERING' && (
          <label style={{ display: 'grid', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>Liczba gości</span>
            <input type='number' min='0' value={values.numberOfGuests} onChange={event => onChange('numberOfGuests', event.target.value)} style={inputStyle} />
          </label>
        )}

        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>
            {values.type === 'CATERING' ? 'Rodzaj menu' : values.type === 'DECORATION' ? 'Motyw dekoracji' : 'Wykonawca'}
          </span>
          <input value={values.detail} onChange={event => onChange('detail', event.target.value)} style={inputStyle} />
        </label>

        {values.type === 'CATERING' && cateringCost !== null && (
          <strong style={{ color: 'var(--primary)' }}>Szacowany koszt: {cateringCost.toLocaleString('pl-PL')} PLN</strong>
        )}

        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.35rem' }}>
          <button type='button' onClick={onCancel} style={{ flex: 1, minHeight: '48px', borderRadius: '14px', border: '1px solid #efe1d0', background: '#fffdfa', fontWeight: 600, cursor: 'pointer' }}>Anuluj</button>
          <button type='button' onClick={onSubmit} style={{ flex: 1, minHeight: '48px', borderRadius: '14px', border: 'none', background: '#d67c3a', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            {editing ? 'Zapisz zmiany' : 'Dodaj zadanie'}
          </button>
        </div>

        {editing && onDelete && (
          <button type='button' onClick={onDelete} style={{ minHeight: '44px', borderRadius: '12px', border: '1px solid #f4c1c1', background: '#fff2f2', color: '#c53030', fontWeight: 600, cursor: 'pointer' }}>
            Usuń zadanie
          </button>
        )}
      </div>
    </article>
  )
}
