import { type HistoryEntry } from '../data/budgetMock'
import { BudgetIcon } from './BudgetIcon'

type PaymentHistoryProps = {
  history: HistoryEntry[]
}

export function PaymentHistory({ history }: PaymentHistoryProps) {
  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      {history.map((entry) => (
        <div key={entry.id} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
          <div style={{ 
            width: '2.5rem', 
            height: '2.5rem', 
            borderRadius: '50%', 
            background: entry.type === 'reminder_sent' ? '#fdf2f2' : '#fcf6f1',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            zIndex: 1
          }}>
            <BudgetIcon 
              name={entry.type === 'reminder_sent' ? 'alert' : entry.type === 'payment_confirmed' ? 'check' : 'file-text'} 
              color={entry.type === 'reminder_sent' ? '#c53030' : 'var(--primary)'} 
              size={18} 
            />
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>{entry.title}</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{entry.date}</span>
            </div>
            <p style={{ margin: '0.25rem 0 0.5rem', fontSize: '0.85rem', color: 'var(--muted)', lineHeight: '1.4' }}>
              {entry.description}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '1.5rem', 
                height: '1.5rem', 
                borderRadius: '50%', 
                background: 'var(--primary-soft)', 
                color: 'var(--primary)',
                fontSize: '0.7rem',
                fontWeight: 700,
                display: 'grid',
                placeItems: 'center'
              }}>
                {entry.user.initials}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{entry.user.name}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
