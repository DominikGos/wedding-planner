import { BudgetIcon } from './BudgetIcon'
import { useTranslation } from 'react-i18next'

type BudgetSummaryProps = {
  paidCount: number
  totalCount: number
  totalRemaining: number
  hasOverdue: boolean
}

export function BudgetSummary({ paidCount, totalCount, totalRemaining, hasOverdue }: BudgetSummaryProps) {
  const { t } = useTranslation()
  const percentage = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div className='surface-panel' style={{ padding: '1.25rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{t('budget.summary.progressTitle')}</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginTop: '0.25rem' }}>
            <strong style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>{percentage}%</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{t('budget.summary.completed')}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          <span style={{ color: 'var(--muted)' }}>{t('budget.summary.paidInvoices')}</span>
          <span style={{ fontWeight: 600 }}>{paidCount}/{totalCount}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--muted)' }}>{t('budget.summary.remainingToPay')}</span>
          <span style={{ fontWeight: 600 }}>{totalRemaining.toLocaleString()} PLN</span>
        </div>
      </div>

      {hasOverdue && (
        <div className='app-alert app-alert-danger' style={{
          display: 'flex',
          gap: '0.75rem',
          padding: '1rem'
        }}>
          <BudgetIcon name='alert' color='var(--danger)' size={20} />
          <div>
            <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>{t('budget.summary.overdueAlert')}</h5>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem' }}>
              {t('budget.summary.overdueDesc')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
