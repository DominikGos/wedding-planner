import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../../store'
import {
  approveOfflinePayment,
  cancelPayment,
  createPayment,
  getPayments,
  getPaymentSummary,
  retryPayment,
  type PaymentMethod,
  type PaymentResponse,
  type PaymentStatus,
  type PaymentSummaryResponse,
} from '../../../api/paymentApi'

import { BudgetStatCard } from '../components/BudgetStatCard'
import { PaymentTable, type PaymentTableAction, type PaymentTablePayment } from '../components/PaymentTable'
import { PaymentHistory } from '../components/PaymentHistory'
import { BudgetSummary } from '../components/BudgetSummary'
import { BudgetIcon } from '../components/BudgetIcon'
import { history as initialHistory } from '../data/budgetMock'

const emptySummary: PaymentSummaryResponse = {
  totalAmount: 0,
  successAmount: 0,
  pendingAmount: 0,
  failedAmount: 0,
  cancelledAmount: 0,
  offlineAmount: 0,
  offlineApprovedAmount: 0,
}

const initialCreatePaymentForm = {
  expenseId: '1',
  vendorId: '1',
  amount: '',
  method: 'ONLINE' as PaymentMethod,
  currency: 'PLN',
}

function formatDate(value: string | null) {
  if (!value) return '-'

  return new Date(value).toLocaleDateString('pl-PL')
}

function mapPaymentToTable(payment: PaymentResponse): PaymentTablePayment {
  return {
    id: payment.id,
    vendor: payment.vendorId ? `Dostawca #${payment.vendorId}` : 'Dostawca nieokreślony',
    invoiceNumber: `Płatność #${payment.id}`,
    service: payment.expenseId ? `Wydatek #${payment.expenseId}` : 'Wydatek nieokreślony',
    amount: payment.amount,
    currency: payment.currency,
    date: formatDate(payment.updatedAt || payment.createdAt),
    paidAt: payment.status === 'SUCCESS' || payment.status === 'OFFLINE_APPROVED'
      ? formatDate(payment.approvedAt || payment.updatedAt)
      : undefined,
    status: payment.status,
    failureReason: payment.failureReason,
  }
}

export function BudgetPage() {
  const user = useSelector((state: RootState) => state.auth.user)
  const token = useSelector((state: RootState) => state.auth.token)
  const userRole = user?.role || 'couple'

  const [payments, setPayments] = useState<PaymentResponse[]>([])
  const [summary, setSummary] = useState<PaymentSummaryResponse>(emptySummary)
  const [filter, setFilter] = useState<PaymentStatus | 'all'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)
  const [createPaymentForm, setCreatePaymentForm] = useState(initialCreatePaymentForm)
  const [history] = useState(initialHistory)
  const [budgetNotification, setBudgetNotification] = useState<{ text: string; type: 'success' | 'info' } | null>(null)

  const showNotification = (text: string, type: 'success' | 'info' = 'success') => {
    setBudgetNotification({ text, type })
    setTimeout(() => {
      setBudgetNotification(null)
    }, 4000)
  }

  const loadPayments = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [paymentsResponse, summaryResponse] = await Promise.all([
        getPayments({ token: token ?? undefined }),
        getPaymentSummary({ token: token ?? undefined }),
      ])
      setPayments(paymentsResponse)
      setSummary(summaryResponse)
    } catch {
      setError('Nie udało się pobrać płatności z backendu. Sprawdź, czy serwer działa na localhost:8080.')
      setPayments([])
      setSummary(emptySummary)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadPayments()
  }, [loadPayments])

  const stats = useMemo(() => {
    const paid = summary.successAmount + summary.offlineApprovedAmount
    const pending = summary.pendingAmount + summary.offlineAmount
    const overdue = summary.failedAmount
    const paidCount = payments.filter(payment => payment.status === 'SUCCESS' || payment.status === 'OFFLINE_APPROVED').length
    const totalCount = payments.length

    return {
      total: summary.totalAmount,
      paid,
      pending,
      overdue,
      paidCount,
      totalCount,
    }
  }, [payments, summary])

  const filteredPayments = useMemo(() => {
    const list = filter === 'all' ? payments : payments.filter(payment => payment.status === filter)
    return list.map(mapPaymentToTable)
  }, [payments, filter])

  const handlePaymentAction = async (id: number, action: PaymentTableAction) => {
    setActionLoadingId(id)
    setError(null)

    try {
      if (action === 'retry') {
        await retryPayment(id, { token: token ?? undefined })
        showNotification('Ponowiono płatność.', 'success')
      }

      if (action === 'cancel') {
        await cancelPayment(id, {}, { token: token ?? undefined })
        showNotification('Płatność została anulowana.', 'info')
      }

      if (action === 'approve-offline') {
        await approveOfflinePayment(id, {}, { token: token ?? undefined })
        showNotification('Płatność offline została zatwierdzona.', 'success')
      }

      await loadPayments()
    } catch {
      setError('Nie udało się wykonać akcji płatności. Spróbuj ponownie.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleExport = () => {
    showNotification('Eksport raportu nie jest jeszcze podłączony do backendu.', 'info')
  }

  const handleCreatePayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsCreatingPayment(true)
    setError(null)

    try {
      await createPayment({
        expenseId: Number(createPaymentForm.expenseId),
        vendorId: Number(createPaymentForm.vendorId),
        amount: Number(createPaymentForm.amount),
        method: createPaymentForm.method,
        currency: createPaymentForm.currency || 'PLN',
      }, { token: token ?? undefined })

      setCreatePaymentForm(initialCreatePaymentForm)
      setIsCreateFormOpen(false)
      showNotification('Płatność została dodana.', 'success')
      await loadPayments()
    } catch {
      setError('Nie udało się dodać płatności. Sprawdź wpisane ID i spróbuj ponownie.')
    } finally {
      setIsCreatingPayment(false)
    }
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {budgetNotification && (
        <div style={{
          padding: '1rem',
          borderRadius: '12px',
          background: budgetNotification.type === 'success' ? '#daf6e5' : '#e8efff',
          color: budgetNotification.type === 'success' ? '#14834b' : '#4b6acb',
          border: `1px solid ${budgetNotification.type === 'success' ? '#bfeecf' : '#cbd9f9'}`,
          fontWeight: 600,
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease'
        }}>
          {budgetNotification.text}
        </div>
      )}

      {error && (
        <div style={{
          padding: '1rem',
          borderRadius: '12px',
          background: '#fff2f2',
          color: '#c53030',
          border: '1px solid #ffdfdf',
          fontWeight: 600,
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className='page-title'>Panel Płatności</h1>
          <p className='page-subtitle'>
            {userRole === 'planner'
              ? 'Koordynuj płatności Pary Młodej, zatwierdzaj rachunki i śledź faktury'
              : 'Zarządzaj płatnościami dostawców i rejestruj wykonane przelewy'
            }
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleExport}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1rem',
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <BudgetIcon name='file-text' color='var(--text)' size={18} />
            Eksportuj Raport
          </button>
          <button
            onClick={() => setIsCreateFormOpen((isOpen) => !isOpen)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1rem',
              background: 'var(--primary)',
              color: '#fff',
              border: '1px solid var(--primary)',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span>
            Dodaj płatność
          </button>
        </div>
      </header>

      {isCreateFormOpen && (
        <section className='page-card' style={{ padding: '1.25rem', display: 'grid', gap: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Dodaj płatność</h2>
            <p className='page-subtitle' style={{ marginTop: '0.35rem' }}>
              Na potrzeby testów lokalnych użyj ID z seedera, np. expenseId 1, vendorId 1.
            </p>
          </div>

          <form
            onSubmit={handleCreatePayment}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              alignItems: 'end',
            }}
          >
            <label style={{ display: 'grid', gap: '0.4rem', fontWeight: 600 }}>
              expenseId
              <input
                type='number'
                min='1'
                required
                value={createPaymentForm.expenseId}
                onChange={(event) => setCreatePaymentForm((form) => ({ ...form, expenseId: event.target.value }))}
                style={{ padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border)' }}
              />
            </label>

            <label style={{ display: 'grid', gap: '0.4rem', fontWeight: 600 }}>
              vendorId
              <input
                type='number'
                min='1'
                required
                value={createPaymentForm.vendorId}
                onChange={(event) => setCreatePaymentForm((form) => ({ ...form, vendorId: event.target.value }))}
                style={{ padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border)' }}
              />
            </label>

            <label style={{ display: 'grid', gap: '0.4rem', fontWeight: 600 }}>
              Kwota
              <input
                type='number'
                min='0.01'
                step='0.01'
                required
                value={createPaymentForm.amount}
                onChange={(event) => setCreatePaymentForm((form) => ({ ...form, amount: event.target.value }))}
                style={{ padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border)' }}
              />
            </label>

            <label style={{ display: 'grid', gap: '0.4rem', fontWeight: 600 }}>
              Metoda
              <select
                value={createPaymentForm.method}
                onChange={(event) => setCreatePaymentForm((form) => ({ ...form, method: event.target.value as PaymentMethod }))}
                style={{ padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border)', background: '#fff' }}
              >
                <option value='ONLINE'>ONLINE</option>
                <option value='OFFLINE'>OFFLINE</option>
              </select>
            </label>

            <label style={{ display: 'grid', gap: '0.4rem', fontWeight: 600 }}>
              Waluta
              <input
                value={createPaymentForm.currency}
                onChange={(event) => setCreatePaymentForm((form) => ({ ...form, currency: event.target.value }))}
                style={{ padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border)' }}
              />
            </label>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type='submit'
                disabled={isCreatingPayment}
                style={{
                  padding: '0.7rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--primary)',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: isCreatingPayment ? 'not-allowed' : 'pointer',
                  opacity: isCreatingPayment ? 0.75 : 1,
                }}
              >
                {isCreatingPayment ? 'Zapisywanie...' : 'Zapisz'}
              </button>
              <button
                type='button'
                onClick={() => setIsCreateFormOpen(false)}
                disabled={isCreatingPayment}
                style={{
                  padding: '0.7rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: '#fff',
                  fontWeight: 600,
                  cursor: isCreatingPayment ? 'not-allowed' : 'pointer',
                }}
              >
                Anuluj
              </button>
            </div>
          </form>
        </section>
      )}

      <div className='stats-grid'>
        <BudgetStatCard
          title="Suma płatności"
          value={`${stats.total.toLocaleString()} PLN`}
          color="#b85a1f"
          icon="trend"
        />
        <BudgetStatCard
          title="Opłacone"
          value={`${stats.paid.toLocaleString()} PLN`}
          color="#35684f"
          icon="check"
        />
        <BudgetStatCard
          title="Oczekujące"
          value={`${stats.pending.toLocaleString()} PLN`}
          color="#8c5a12"
          icon="clock"
        />
        <BudgetStatCard
          title="Nieudane"
          value={`${stats.overdue.toLocaleString()} PLN`}
          color="#c53030"
          icon="alert"
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2.5fr) minmax(300px, 1fr)',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        <section className='page-card' style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1e8dc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Lista płatności</h2>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value as PaymentStatus | 'all')}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '0.85rem',
                  background: '#fff'
                }}
              >
                <option value="all">Wszystkie statusy</option>
                <option value="SUCCESS">Opłacono</option>
                <option value="PENDING">Oczekuje</option>
                <option value="FAILED">Nieudane</option>
                <option value="CANCELLED">Anulowane</option>
                <option value="OFFLINE">Offline</option>
                <option value="OFFLINE_APPROVED">Offline zatwierdzone</option>
              </select>
              <button style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: '#fff',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              </button>
            </div>
          </div>
          <div style={{ padding: '0.5rem' }}>
            {isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
                Ładowanie płatności...
              </div>
            ) : (
              <PaymentTable
                payments={filteredPayments}
                onAction={handlePaymentAction}
                actionLoadingId={actionLoadingId}
              />
            )}
          </div>
        </section>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <section className='page-card' style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <BudgetIcon name='history' color='var(--primary)' size={20} />
              <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Historia Zmian i Akceptacji</h2>
            </div>
            <PaymentHistory history={history} />
          </section>

          <section className='page-card' style={{ padding: '1.25rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', marginBottom: '1.25rem' }}>Podsumowanie Faktur</h2>
            <BudgetSummary
              paidCount={stats.paidCount}
              totalCount={stats.totalCount}
              totalRemaining={stats.pending + stats.overdue}
              hasOverdue={stats.overdue > 0}
            />
          </section>
        </div>
      </div>
    </div>
  )
}
