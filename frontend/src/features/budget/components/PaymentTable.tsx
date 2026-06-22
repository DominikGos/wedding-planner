import type { PaymentStatus } from '../../../api/paymentApi'
import { BudgetIcon } from './BudgetIcon'

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

export type PaymentTableAction = 'retry' | 'cancel' | 'approve-offline'

type PaymentTableProps = {
  payments: PaymentTablePayment[]
  onAction: (id: number, action: PaymentTableAction) => void
  actionLoadingId?: number | null
}

export function PaymentTable({ payments, onAction, actionLoadingId }: PaymentTableProps) {
  const getStatusStyle = (status: PaymentStatus) => {
    switch (status) {
      case 'SUCCESS':
        return { className: 'status-pill status-pill-success', label: 'Opłacono', icon: 'check' as const, iconColor: 'var(--ok)' }
      case 'PENDING':
        return { className: 'status-pill status-pill-warning', label: 'Oczekuje', icon: 'clock' as const, iconColor: 'var(--warning)' }
      case 'FAILED':
        return { className: 'status-pill status-pill-danger', label: 'Nieudana', icon: 'alert' as const, iconColor: 'var(--danger)' }
      case 'CANCELLED':
        return { className: 'status-pill', label: 'Anulowana', icon: 'file-text' as const, iconColor: 'var(--muted)' }
      case 'OFFLINE':
        return { className: 'status-pill', label: 'Offline', icon: 'file-text' as const, iconColor: 'var(--muted)' }
      case 'OFFLINE_APPROVED':
        return { className: 'status-pill status-pill-info', label: 'Offline zatwierdzone', icon: 'check' as const, iconColor: 'var(--info)' }
    }
  }

  const getAction = (status: PaymentStatus): { label: string; action: PaymentTableAction } | null => {
    if (status === 'FAILED') return { label: 'Ponów', action: 'retry' }
    if (status === 'PENDING') return { label: 'Anuluj', action: 'cancel' }
    if (status === 'OFFLINE') return { label: 'Zatwierdź', action: 'approve-offline' }
    return null
  }

  if (payments.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
        Brak płatności do wyświetlenia.
      </div>
    )
  }

  return (
    <div className='data-table-wrapper'>
      <table className='data-table'>
        <thead>
          <tr>
            <th style={headerStyle}>Dostawca</th>
            <th style={headerStyle}>Usługa</th>
            <th style={headerStyle}>Kwota</th>
            <th style={headerStyle}>Data</th>
            <th style={headerStyle}>Status płatności</th>
            <th style={headerStyle}>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => {
            const status = getStatusStyle(payment.status)
            const action = getAction(payment.status)
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
                      Opłacono: {payment.paidAt}
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
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={iconButtonStyle} title="Pokaż szczegóły płatności">
                      <BudgetIcon name='file-text' color='var(--muted)' size={18} />
                    </button>
                    {action && (
                      <button
                        style={{
                          ...actionButtonStyle,
                          cursor: isActionLoading ? 'wait' : 'pointer',
                          opacity: isActionLoading ? 0.7 : 1,
                        }}
                        disabled={isActionLoading}
                        onClick={() => onAction(payment.id, action.action)}
                      >
                        {isActionLoading ? 'Trwa...' : action.label}
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
