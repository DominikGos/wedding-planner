import type { CateringTaskInfo } from '../data/cateringMock'

function CalendarIcon() {
  return (
    <svg
      width='22'
      height='22'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      stroke='var(--muted)'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <rect x='4' y='5.5' width='16' height='14.5' rx='2.5' />
      <path d='M8 3.5V7' />
      <path d='M16 3.5V7' />
      <path d='M4 9.5H20' />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg
      width='22'
      height='22'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      stroke='var(--muted)'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <circle cx='12' cy='8' r='3.2' />
      <path d='M6.5 19C7.5 16.7 9.5 15.3 12 15.3C14.5 15.3 16.5 16.7 17.5 19' />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg
      width='22'
      height='22'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      stroke='var(--muted)'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <circle cx='12' cy='12' r='8.5' />
      <path d='M12 8V12.5' />
      <circle cx='12' cy='16' r='0.8' fill='var(--muted)' stroke='none' />
    </svg>
  )
}

export function TaskInfoCard({ info }: { info: CateringTaskInfo }) {
  return (
    <article className='page-card' style={{ padding: 0, overflow: 'hidden' }}>
      <div
        style={{
          padding: '1.2rem 1.35rem',
          borderBottom: '1px solid #f1e8dc',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Informacje o Zadaniu</h2>
      </div>

      <div style={{ padding: '1.35rem', display: 'grid', gap: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
          <CalendarIcon />
          <div>
            <p style={{ margin: 0, color: 'var(--muted)' }}>Termin</p>
            <strong style={{ display: 'block', marginTop: '0.2rem', fontSize: '1rem' }}>
              {info.date}
            </strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
          <UserIcon />
          <div>
            <p style={{ margin: 0, color: 'var(--muted)' }}>Przypisano do</p>
            <strong style={{ display: 'block', marginTop: '0.2rem', fontSize: '1rem' }}>
              {info.assignee}
            </strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
          <AlertIcon />
          <div>
            <p style={{ margin: 0, color: 'var(--muted)' }}>Priorytet</p>
            <span
              style={{
                display: 'inline-block',
                marginTop: '0.35rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                background: '#fff2cc',
                color: '#d37b00',
                fontWeight: 600,
                border: '1px solid #f5d57d',
              }}
            >
              {info.priority}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
