import { type Payment } from '../data/budgetMock'
import { BudgetIcon } from './BudgetIcon'

type PaymentTableProps = {
  payments: Payment[]
  onPay: (id: string) => void
}

export function PaymentTable({ payments, onPay }: PaymentTableProps) {
  const getStatusStyle = (status: Payment['status']) => {
    switch (status) {
      case 'paid':
        return { bg: '#eef8f3', text: '#35684f', label: 'Opłacono', icon: 'check' as const }
      case 'pending':
        return { bg: '#fff9eb', text: '#8c5a12', label: 'Oczekuje', icon: 'clock' as const }
      case 'overdue':
        return { bg: '#fff2f2', text: '#c53030', label: 'Zaległe', icon: 'alert' as const }
    }
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={headerStyle}>Dostawca</th>
            <th style={headerStyle}>Usługa</th>
            <th style={headerStyle}>Kwota</th>
            <th style={headerStyle}>Termin</th>
            <th style={headerStyle}>Status Płatności</th>
            <th style={headerStyle}>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => {
            const status = getStatusStyle(p.status)
            return (
              <tr key={p.id} style={{ borderBottom: '1px solid #f6f3ed' }}>
                <td style={cellStyle}>
                  <div style={{ fontWeight: 600 }}>{p.vendor}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{p.invoiceNumber}</div>
                </td>
                <td style={cellStyle}>{p.service}</td>
                <td style={{ ...cellStyle, fontWeight: 600, color: 'var(--primary)' }}>
                  {p.amount.toLocaleString()} PLN
                </td>
                <td style={cellStyle}>
                  <div>{p.deadline}</div>
                  {p.paidAt && (
                    <div style={{ fontSize: '0.75rem', color: '#35684f' }}>
                      Zapłacono: {p.paidAt}
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
                  >
                    <BudgetIcon name={status.icon} color={status.text} size={14} strokeWidth={2.5} />
                    {status.label}
                  </span>
                </td>
                <td style={cellStyle}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={iconButtonStyle}>
                      <BudgetIcon name='file-text' color='var(--muted)' size={18} />
                    </button>
                    {p.status !== 'paid' && (
                      <button 
                        style={actionButtonStyle}
                        onClick={() => onPay(p.id)}
                      >
                        Zapłać
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
  verticalAlign: 'top'
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
  cursor: 'pointer',
}
