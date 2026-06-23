import type { PaymentStatus } from '../../../api/paymentApi'
import { BudgetIcon } from './BudgetIcon'
import { useTranslation } from 'react-i18next'

export type PaymentTablePayment = {
  id: number
  vendor: string
  invoiceNumber: string
  service: string
  amount: number
  currency: string
  date: string
  paidAt?: string
  status: PaymentStatus
  failureReason?: string | null
}

export type PaymentTableAction = 'retry' | 'cancel' | 'approve-offline' | 'pay-online'

type PaymentTableProps = {
  payments: PaymentTablePayment[]
  onAction: (id: number, action: PaymentTableAction) => void
  actionLoadingId?: number | null
  userRole: 'couple' | 'planner'
}

export function PaymentTable({ payments, onAction, actionLoadingId, userRole }: PaymentTableProps) {
  const { t } = useTranslation()

  const getStatusStyle = (status: PaymentStatus) => {
    switch (status) {
      case 'SUCCESS':
        return { className: 'status-pill status-pill-success', label: t('budget.table.statusSuccess'), icon: 'check' as const, iconColor: 'var(--ok)' }
      case 'PENDING':
        return { className: 'status-pill status-pill-warning', label: t('budget.table.statusPending'), icon: 'clock' as const, iconColor: 'var(--warning)' }
      case 'FAILED':
        return { className: 'status-pill status-pill-danger', label: t('budget.table.statusFailed'), icon: 'alert' as const, iconColor: 'var(--danger)' }
      case 'CANCELLED':
        return { className: 'status-pill', label: t('budget.table.statusCancelled'), icon: 'file-text' as const, iconColor: 'var(--muted)' }
      case 'OFFLINE':
        return { className: 'status-pill', label: t('budget.table.statusOffline'), icon: 'file-text' as const, iconColor: 'var(--muted)' }
      case 'OFFLINE_APPROVED':
        return { className: 'status-pill status-pill-info', label: t('budget.table.statusOfflineApproved'), icon: 'check' as const, iconColor: 'var(--info)' }
    }
  }

  if (payments.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
        {t('budget.table.noPayments')}
      </div>
    )
  }

  return (
    <div className='data-table-wrapper'>
      <table className='data-table'>
        <thead>
          <tr>
            <th style={headerStyle}>{t('budget.table.vendor')}</th>
            <th style={headerStyle}>{t('budget.table.service')}</th>
            <th style={headerStyle}>{t('budget.table.amount')}</th>
            <th style={headerStyle}>{t('budget.table.date')}</th>
            <th style={headerStyle}>{t('budget.table.status')}</th>
            <th style={headerStyle}>{t('budget.table.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => {
            const status = getStatusStyle(payment.status)
            const isActionLoading = actionLoadingId === payment.id

            return (
              <tr key={payment.id}>
                <td style={cellStyle}>
                  <div style={{ fontWeight: 600 }}>{payment.vendor}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{payment.invoiceNumber}</div>
                </td>
                <td style={cellStyle}>{payment.service}</td>
                <td style={{ ...cellStyle, fontWeight: 600, color: 'var(--primary)' }}>
                  {payment.amount.toLocaleString()} {payment.currency}
                </td>
                <td style={cellStyle}>
                  <div>{payment.date}</div>
                  {payment.paidAt && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--ok)' }}>
                      {t('budget.table.paidAt', { date: payment.paidAt })}
                    </div>
                  )}
                </td>
                <td style={cellStyle}>
                  <span className={status.className} title={payment.failureReason || undefined}>
                    <BudgetIcon name={status.icon} color={status.iconColor} size={14} strokeWidth={2.5} />
                    {status.label}
                  </span>
                </td>
                <td style={cellStyle}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button style={iconButtonStyle} title={t('budget.table.tooltipDetails')}>
                      <BudgetIcon name='file-text' color='var(--muted)' size={18} />
                    </button>
                    {payment.status === 'PENDING' && userRole === 'couple' && (
                      <button
                        style={{ ...actionButtonStyle, background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)', cursor: isActionLoading ? 'wait' : 'pointer', opacity: isActionLoading ? 0.7 : 1 }}
                        disabled={isActionLoading}
                        onClick={() => onAction(payment.id, 'pay-online')}
                      >
                        {isActionLoading ? t('budget.table.btnLoading') : t('budget.table.btnPay')}
                      </button>
                    )}
                    {payment.status === 'PENDING' && (
                      <button
                        style={{ ...actionButtonStyle, color: 'var(--danger)', borderColor: 'var(--danger-soft)', cursor: isActionLoading ? 'wait' : 'pointer', opacity: isActionLoading ? 0.7 : 1 }}
                        disabled={isActionLoading}
                        onClick={() => onAction(payment.id, 'cancel')}
                      >
                        {isActionLoading ? t('budget.table.btnLoading') : t('budget.table.btnCancel')}
                      </button>
                    )}
                    {(payment.status === 'FAILED' || payment.status === 'CANCELLED') && userRole === 'couple' && (
                      <button
                        style={{ ...actionButtonStyle, cursor: isActionLoading ? 'wait' : 'pointer', opacity: isActionLoading ? 0.7 : 1 }}
                        disabled={isActionLoading}
                        onClick={() => onAction(payment.id, 'retry')}
                      >
                        {isActionLoading ? t('budget.table.btnLoading') : t('budget.table.btnRetry')}
                      </button>
                    )}
                    {payment.status === 'OFFLINE' && userRole === 'planner' && (
                      <button
                        style={{ ...actionButtonStyle, background: '#35684f', color: '#fff', borderColor: '#35684f', cursor: isActionLoading ? 'wait' : 'pointer', opacity: isActionLoading ? 0.7 : 1 }}
                        disabled={isActionLoading}
                        onClick={() => onAction(payment.id, 'approve-offline')}
                      >
                        {isActionLoading ? t('budget.table.btnLoading') : t('budget.table.btnApprove')}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const headerStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: 600,
  color: 'var(--muted)',
}

const cellStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  verticalAlign: 'top',
}

const iconButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0.25rem',
  display: 'flex',
  alignItems: 'center',
}

const actionButtonStyle: React.CSSProperties = {
  background: 'var(--surface)',
  color: 'var(--primary)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '0.4rem 0.8rem',
  fontSize: '0.85rem',
  fontWeight: 600,
  transition: 'all 0.2s',
}
