import { useTranslation } from 'react-i18next'
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
  error: string | null
  onChange: (field: keyof TaskFormState, value: string) => void
  onCancel: () => void
  onSubmit: () => void
  onDelete?: () => void
}

export function TaskForm({ values, editing, error, onChange, onCancel, onSubmit, onDelete }: TaskFormProps) {
  const { t, i18n } = useTranslation()
  const cateringCost = values.price && values.numberOfGuests
    ? Number(values.price) * Number(values.numberOfGuests)
    : null

  const inputStyle = {
    width: '100%',
    minHeight: '48px',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--surface)',
    color: 'var(--text)',
    padding: '0 1rem',
  }
  const selectStyle = { ...inputStyle, paddingRight: '2.5rem' }

  return (
    <article className='page-card' style={{ padding: 0, overflow: 'hidden' }}>
      <div className="task-form-header" style={{ padding: '1.2rem 1.35rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{editing ? t('tasks.editTask') : t('tasks.addNewTask')}</h2>
        <button type='button' onClick={onCancel} className='button-secondary' style={{ minHeight: '36px', padding: '0.4rem 0.75rem' }}>{t('tasks.closeBtn')}</button>
      </div>

      <div style={{ padding: '1.25rem', display: 'grid', gap: '1rem' }}>
        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>{t('tasks.fieldName')}</span>
          <input value={values.name} onChange={event => onChange('name', event.target.value)} style={inputStyle} />
        </label>

        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>{t('tasks.fieldType')}</span>
          <select value={values.type} disabled={editing} onChange={event => onChange('type', event.target.value)} style={selectStyle} className='task-form-control'>
            {taskTypes.map(type => (
              <option key={type.value} value={type.value}>
                {t(`tasks.types.${type.value}`)}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>{t('tasks.fieldDescription')}</span>
          <textarea value={values.description} onChange={event => onChange('description', event.target.value)} style={{ ...inputStyle, minHeight: '100px', padding: '0.9rem 1rem', resize: 'vertical' }} />
        </label>

        <div className="form-two-columns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          <label style={{ display: 'grid', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>{t('tasks.fieldDate')}</span>
            <input type='date' value={values.date} onChange={event => onChange('date', event.target.value)} style={inputStyle} />
          </label>
          <label style={{ display: 'grid', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>{t('tasks.fieldTime')}</span>
            <input type='time' value={values.time} onChange={event => onChange('time', event.target.value)} style={inputStyle} />
          </label>
        </div>

        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>{t('tasks.fieldPriority')}</span>
          <select value={values.priority} onChange={event => onChange('priority', event.target.value)} style={selectStyle} className='task-form-control'>
            <option value='1'>{t('tasks.priorityLow')}</option>
            <option value='2'>{t('tasks.priorityMedium')}</option>
            <option value='3'>{t('tasks.priorityHigh')}</option>
          </select>
        </label>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <strong>{t('tasks.detailsAndCost')}</strong>
          <span style={{ marginLeft: '0.5rem', color: 'var(--muted)', fontSize: '0.85rem' }}>{t('common.optional')}</span>
        </div>

        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>{values.type === 'CATERING' ? t('tasks.pricePerGuest') : t('tasks.estimatedTotalCost')}</span>
          <input type='number' min='0' value={values.price} onChange={event => onChange('price', event.target.value)} style={inputStyle} />
        </label>

        {values.type === 'CATERING' && (
          <label style={{ display: 'grid', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>{t('tasks.guestsCountLabel')}</span>
            <input type='number' min='0' value={values.numberOfGuests} onChange={event => onChange('numberOfGuests', event.target.value)} style={inputStyle} />
          </label>
        )}

        <label style={{ display: 'grid', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>
            {values.type === 'CATERING' ? t('tasks.menuType') : values.type === 'DECORATION' ? t('tasks.decorationTheme') : t('tasks.performerName')}
          </span>
          <input value={values.detail} onChange={event => onChange('detail', event.target.value)} style={inputStyle} />
        </label>

        {values.type === 'CATERING' && cateringCost !== null && (
          <strong style={{ color: 'var(--primary)' }}>
            {t('tasks.estimatedCostLabel', { cost: cateringCost.toLocaleString(i18n.language === 'pl' ? 'pl-PL' : 'en-US') })}
          </strong>
        )}

        {error && (
          <div className='app-alert app-alert-danger' style={{ margin: '0.2rem 0', padding: '0.75rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div className="form-actions" style={{ display: 'flex', gap: '0.8rem', marginTop: '0.35rem' }}>
          <button type='button' onClick={onCancel} className='button-secondary' style={{ flex: 1 }}>{t('common.cancel')}</button>
          <button type='button' onClick={onSubmit} className='button-primary' style={{ flex: 1 }}>
            {editing ? t('tasks.saveChanges') : t('tasks.addTaskBtn')}
          </button>
        </div>

        {editing && onDelete && (
          <button type='button' onClick={onDelete} style={{ minHeight: '44px', borderRadius: '12px', border: '1px solid var(--danger)', background: 'var(--danger-soft)', color: 'var(--danger)', fontWeight: 600, cursor: 'pointer' }}>
            {t('tasks.deleteTaskBtn')}
          </button>
        )}
      </div>
    </article>
  )
}
