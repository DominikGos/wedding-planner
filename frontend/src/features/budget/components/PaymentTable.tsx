import type { PaymentStatus } from '../../../api/paymentApi'
import { BudgetIcon } from './BudgetIcon'
import { useTranslation } from 'react-i18next'

export const localizePaymentError = (msg: string | null | undefined, lng: string): string | null => {
  if (!msg) return null;
  
  const isEn = lng === 'en';
  const lowerMsg = msg.toLowerCase();
  
  if (!isEn) {
    // Tłumaczenia z angielskiego na polski
    if (lowerMsg.includes('passed has expired') || lowerMsg.includes('blik codes expire after 2 minutes') || lowerMsg.includes('blik codes expire')) {
      return 'Kod BLIK wygasł. Kody BLIK są ważne przez 2 minuty. Wygeneruj nowy kod w aplikacji bankowej.';
    }
    if (lowerMsg.includes('payment limit on this bank account has been reached') || lowerMsg.includes('payment limit')) {
      return 'Płatność została odrzucona z powodu przekroczenia limitu transakcyjnego na koncie bankowym.';
    }
    if (lowerMsg.includes('insufficient funds') || lowerMsg.includes('insufficient_funds')) {
      return 'Brak wystarczających środków na koncie bankowym.';
    }
    if (lowerMsg.includes('customer declined this payment') || lowerMsg.includes('customer declined')) {
      return 'Płatność została odrzucona przez klienta.';
    }
    if (lowerMsg.includes('declined by the customer\'s bank') || lowerMsg.includes('bank declined') || lowerMsg.includes('customer\'s bank for an unknown reason')) {
      return 'Płatność została odrzucona przez bank klienta z nieznanej przyczyny.';
    }
    if (lowerMsg.includes('declined for an unknown reason')) {
      return 'Płatność została odrzucona z nieznanej przyczyny.';
    }
    if (lowerMsg.includes('didn\'t approve this payment within the allocated') || lowerMsg.includes('within the allocated 60 seconds')) {
      return 'Klient nie zatwierdził płatności w wymaganym czasie (60 sekund).';
    }
    if (lowerMsg.includes('request to the customer\'s bank timed out') || lowerMsg.includes('bank timed out')) {
      return 'Upłynął limit czasu na odpowiedź banku klienta.';
    }
    if (lowerMsg.includes('request to the blik network timed out') || lowerMsg.includes('blik network timed out')) {
      return 'Upłynął limit czasu połączenia z siecią BLIK.';
    }
    if (lowerMsg.includes('expired card') || lowerMsg.includes('expired_card') || lowerMsg.includes('has expired')) {
      return 'Karta płatnicza utraciła ważność.';
    }
    if (lowerMsg.includes('incorrect cvc') || lowerMsg.includes('incorrect_cvc') || lowerMsg.includes('invalid cvc')) {
      return 'Niepoprawny kod CVC/CVV karty.';
    }
    if (lowerMsg.includes('incorrect number') || lowerMsg.includes('incorrect_number') || lowerMsg.includes('invalid number')) {
      return 'Niepoprawny numer karty płatniczej.';
    }
    if (lowerMsg.includes('authentication_failure') || lowerMsg.includes('authentication failed') || lowerMsg.includes('3d secure')) {
      return 'Autoryzacja płatności (np. 3D Secure) nie powiodła się.';
    }
    if (lowerMsg.includes('blik_code_invalid') || lowerMsg.includes('blik_invalid_code') || (lowerMsg.includes('blik') && lowerMsg.includes('code') && (lowerMsg.includes('invalid') || lowerMsg.includes('incorrect')))) {
      return 'Twój kod BLIK jest nieprawidłowy. Sprawdź kod w aplikacji bankowej i spróbuj ponownie.';
    }
    if (lowerMsg.includes('canceled') || lowerMsg.includes('cancelled')) {
      return 'Płatność została anulowana.';
    }
    return msg;
  } else {
    // Tłumaczenia z polskiego na angielski
    if (msg.includes('Płatność została anulowana.')) {
      return 'Payment has been cancelled.';
    }
    if (msg.includes('Płatność odrzucona lub anulowana przez użytkownika.')) {
      return 'Payment declined or cancelled by the user.';
    }
    if (msg.includes('Ostatnia próba płatności nie powiodła się. Status Stripe:')) {
      return msg.replace('Ostatnia próba płatności nie powiodła się. Status Stripe:', 'The last payment attempt failed. Stripe status:');
    }
    if (msg.includes('Ostatnia próba płatności nie powiodła się.')) {
      return 'The last payment attempt failed.';
    }
    if (msg.includes('Płatność online nie powiodła się.')) {
      return 'Online payment failed.';
    }
    if (msg.includes('Adres e-mail jest niekompletny.')) {
      return 'Email address is incomplete.';
    }
    return msg;
  }
};

export const translateErrorToPolish = (msg: string | null | undefined): string | null => {
  return localizePaymentError(msg, 'pl');
};

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
  const { t, i18n } = useTranslation()

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
                  <span className={status.className} title={localizePaymentError(payment.failureReason, i18n.language) || undefined}>
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
                    {payment.status === 'FAILED' && userRole === 'couple' && (
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
