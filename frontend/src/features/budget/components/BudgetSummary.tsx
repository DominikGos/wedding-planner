import { BudgetIcon } from './BudgetIcon'

type BudgetSummaryProps = {
  paidCount: number
  totalCount: number
  totalRemaining: number
  hasOverdue: boolean
}

export function BudgetSummary({ paidCount, totalCount, totalRemaining, hasOverdue }: BudgetSummaryProps) {
  const percentage = Math.round((paidCount / totalCount) * 100)

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ background: '#fcfaf7', borderRadius: '14px', padding: '1.25rem', border: '1px solid #f1e8dc' }}>
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Postęp płatności</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginTop: '0.25rem' }}>
            <strong style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>{percentage}%</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>ukończono</span>
          </div>
        </div>

        <div style={{ 
          height: '10px', 
          background: '#ede0d4', 
          borderRadius: '999px', 
          overflow: 'hidden',
          marginBottom: '1.25rem'
        }}>
          <div style={{ 
            height: '100%', 
            width: `${percentage}%`, 
            background: 'var(--primary)',
            transition: 'width 0.5s ease'
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          <span style={{ color: 'var(--muted)' }}>Opłacone faktury</span>
          <span style={{ fontWeight: 600 }}>{paidCount}/{totalCount}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--muted)' }}>Pozostało do zapłaty</span>
          <span style={{ fontWeight: 600 }}>{totalRemaining.toLocaleString()} PLN</span>
        </div>
      </div>

      {hasOverdue && (
        <div style={{ 
          display: 'flex', 
          gap: '0.75rem', 
          padding: '1rem', 
          borderRadius: '12px', 
          background: '#fff2f2', 
          border: '1px solid #ffdfdf' 
        }}>
          <BudgetIcon name='alert' color='#c53030' size={20} />
          <div>
            <h5 style={{ margin: 0, color: '#c53030', fontSize: '0.9rem', fontWeight: 600 }}>Uwaga: Zaległe płatności</h5>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#c53030' }}>
              Płatności wymagają natychmiastowej uwagi
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
