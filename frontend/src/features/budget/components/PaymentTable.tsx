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
        return { bg: '#eef8f3', text: '#35684f', label: 'Opłacono', icon: 'check' as const }
      case 'PENDING':
        return { bg: '#fff9eb', text: '#8c5a12', label: 'Oczekuje', icon: 'clock' as const }
      case 'FAILED':
        return { bg: '#fff2f2', text: '#c53030', label: 'Nieudana', icon: 'alert' as const }
      case 'CANCELLED':
        return { bg: '#f4f1ed', text: '#6f6256', label: 'Anulowana', icon: 'file-text' as const }
      case 'OFFLINE':
        return { bg: '#f4f1ed', text: '#6f6256', label: 'Offline', icon: 'file-text' as const }
      case 'OFFLINE_APPROVED':
        return { bg: '#eef4ff', text: '#2f6db5', label: 'Offline zatwierdzone', icon: 'check' as const }
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
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
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
              <tr key={payment.id} style={{ borderBottom: '1px solid #f6f3ed' }}>
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
                    <div style={{ fontSize: '0.75rem', color: '#35684f' }}>
                      Opłacono: {payment.paidAt}
                    </div>
                  )}
                </td>
                <td style={cellStyle}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      background: status.bg,
                      color: status.text,
                    }}
                    title={payment.failureReason || undefined}
                  >
                    <BudgetIcon name={status.icon} color={status.text} size={14} strokeWidth={2.5} />
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
  padding: '1rem 0.75rem',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: 'var(--muted)',
}

const cellStyle: React.CSSProperties = {
  padding: '1.25rem 0.75rem',
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
  background: 'var(--primary-soft)',
  color: 'var(--primary)',
  border: 'none',
  borderRadius: '8px',
  padding: '0.4rem 0.8rem',
  fontSize: '0.85rem',
  fontWeight: 600,
  transition: 'all 0.2s',
}
