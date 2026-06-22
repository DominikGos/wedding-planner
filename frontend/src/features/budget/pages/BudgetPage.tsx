import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../../store'
import {
  approveOfflinePayment,
  cancelPayment,
  confirmOnlinePayment,
  createPayment,
  getPayments,
  getPaymentSummary,
  retryPayment,
  type PaymentMethod,
  type PaymentResponse,
  type PaymentStatus,
  type PaymentSummaryResponse,
} from '../../../api/paymentApi'
import { getEventCostSummary, type EventCostSummaryResponse } from '../../../api/eventCostApi'
import { getVendors, type VendorResponse } from '../../../api/vendorApi'
import { getExpenses, type ExpenseResponse } from '../../../api/expenseApi'

import { BudgetStatCard } from '../components/BudgetStatCard'
import { PaymentTable, type PaymentTableAction } from '../components/PaymentTable'
import { PaymentHistory } from '../components/PaymentHistory'
import { BudgetSummary } from '../components/BudgetSummary'
import { BudgetIcon } from '../components/BudgetIcon'
import { type HistoryEntry } from '../data/budgetMock'

const emptySummary: PaymentSummaryResponse = {
  totalAmount: 0,
  successAmount: 0,
  pendingAmount: 0,
  failedAmount: 0,
  cancelledAmount: 0,
  offlineAmount: 0,
  offlineApprovedAmount: 0,
}

const emptyCostSummary: EventCostSummaryResponse = {
  eventId: 0,
  tasks: [],
  totalCost: 0,
}

const taskTypeLabels: Record<EventCostSummaryResponse['tasks'][number]['taskType'], string> = {
  CATERING: 'Catering',
  DECORATION: 'Dekoracje',
  ENTERTAINMENT: 'Rozrywka',
}

const initialCreatePaymentForm = {
  expenseId: '',
  vendorId: '',
  amount: '',
  method: 'ONLINE' as PaymentMethod,
  currency: 'PLN',
}

function formatDate(value: string | null) {
  if (!value) return '-'

  return new Date(value).toLocaleDateString('pl-PL')
}

// mapPaymentToTable has been replaced with inline mapping in filteredPayments to resolve vendor and expense names.

export function BudgetPage() {
  const user = useSelector((state: RootState) => state.auth.user)
  const token = useSelector((state: RootState) => state.auth.token)
  const activeWeddingId = useSelector((state: RootState) => state.auth.activeWeddingId)
  const userRole = user?.role || 'couple'

  const [payments, setPayments] = useState<PaymentResponse[]>([])
  const [summary, setSummary] = useState<PaymentSummaryResponse>(emptySummary)
  const [costSummary, setCostSummary] = useState<EventCostSummaryResponse>(emptyCostSummary)
  const [filter, setFilter] = useState<PaymentStatus | 'all'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isCostLoading, setIsCostLoading] = useState(Boolean(activeWeddingId && token))
  const [error, setError] = useState<string | null>(null)
  const [costError, setCostError] = useState<string | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)
  const [createPaymentForm, setCreatePaymentForm] = useState(initialCreatePaymentForm)
  const [budgetNotification, setBudgetNotification] = useState<{ text: string; type: 'success' | 'info' } | null>(null)
  const [vendorsList, setVendorsList] = useState<VendorResponse[]>([])
  const [expensesList, setExpensesList] = useState<ExpenseResponse[]>([])
  const [onlinePaymentId, setOnlinePaymentId] = useState<number | null>(null)
  const [isGatewaySimulating, setIsGatewaySimulating] = useState(false)

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
        getPayments({ token: token ?? undefined, eventId: activeWeddingId ?? undefined }),
        getPaymentSummary({ token: token ?? undefined, eventId: activeWeddingId ?? undefined }),
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
  }, [token, activeWeddingId])

  const loadDropdownData = useCallback(async () => {
    if (!token) return
    try {
      const [vendorsData, expensesData] = await Promise.all([
        getVendors({ token }),
        getExpenses({ eventId: activeWeddingId ?? undefined }, { token }),
      ])
      setVendorsList(vendorsData)
      setExpensesList(expensesData)
    } catch (err) {
      console.error('Błąd pobierania dostawców lub wydatków:', err)
    }
  }, [token, activeWeddingId])

  const loadEventCosts = useCallback(async () => {
    if (!activeWeddingId || !token) {
      setCostSummary(emptyCostSummary)
      setIsCostLoading(false)
      setCostError(null)
      return
    }

    setIsCostLoading(true)
    setCostError(null)

    try {
      setCostSummary(await getEventCostSummary(activeWeddingId, { token }))
    } catch {
      setCostSummary({ ...emptyCostSummary, eventId: activeWeddingId })
      setCostError('Nie udało się pobrać podsumowania kosztów zadań dla aktywnego wydarzenia.')
    } finally {
      setIsCostLoading(false)
    }
  }, [activeWeddingId, token])

  useEffect(() => {
    queueMicrotask(() => void loadPayments())
  }, [loadPayments])

  useEffect(() => {
    queueMicrotask(() => void loadEventCosts())
  }, [loadEventCosts])

  useEffect(() => {
    queueMicrotask(() => void loadDropdownData())
  }, [loadDropdownData])

  const stats = useMemo(() => {
    const paid = summary.successAmount + summary.offlineApprovedAmount
    const pending = summary.pendingAmount + summary.offlineAmount
    const overdue = summary.failedAmount
    const paidCount = payments.filter(payment => payment.status === 'SUCCESS' || payment.status === 'OFFLINE_APPROVED').length
    const totalCount = payments.length

    return {
      total: summary.totalAmount,
      taskTotal: costSummary.totalCost,
      paid,
      pending,
      overdue,
      paidCount,
      totalCount,
    }
  }, [costSummary.totalCost, payments, summary])

  const taskCostStats = useMemo(() => {
    const costsByType = costSummary.tasks.reduce<Record<string, number>>((groups, task) => {
      groups[task.taskType] = (groups[task.taskType] ?? 0) + task.cost
      return groups
    }, {})

    return Object.entries(costsByType)
      .map(([type, amount]) => ({
        type,
        label: taskTypeLabels[type as keyof typeof taskTypeLabels] ?? type,
        amount,
        percentage: costSummary.totalCost > 0 ? Math.round((amount / costSummary.totalCost) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [costSummary])

  const filteredPayments = useMemo(() => {
    const list = filter === 'all' ? payments : payments.filter(payment => payment.status === filter)
    return list.map((payment) => {
      const vendorObj = vendorsList.find(v => v.id === payment.vendorId)
      const expenseObj = expensesList.find(e => e.id === payment.expenseId)
      return {
        id: payment.id,
        vendor: vendorObj ? (vendorObj.companyName || `Dostawca #${payment.vendorId}`) : `Dostawca #${payment.vendorId}`,
        invoiceNumber: `Płatność #${payment.id}`,
        service: expenseObj ? (expenseObj.description || `Wydatek #${payment.expenseId}`) : `Wydatek #${payment.expenseId}`,
        amount: payment.amount,
        currency: payment.currency,
        date: formatDate(payment.updatedAt || payment.createdAt),
        paidAt: payment.status === 'SUCCESS' || payment.status === 'OFFLINE_APPROVED'
          ? formatDate(payment.approvedAt || payment.updatedAt)
          : undefined,
        status: payment.status,
        failureReason: payment.failureReason,
      }
    })
  }, [payments, filter, vendorsList, expensesList])

  const unpaidExpenses = useMemo(() => {
    return expensesList.filter(exp => {
      const hasPayment = payments.some(p => p.expenseId === exp.id)
      return !hasPayment
    })
  }, [expensesList, payments])

  const generatedHistory = useMemo(() => {
    const entries: (HistoryEntry & { timestamp: number })[] = []

    payments.forEach((payment) => {
      const vendorObj = vendorsList.find(v => v.id === payment.vendorId)
      const vendorName = vendorObj?.companyName || `Dostawca #${payment.vendorId}`
      const formattedAmount = `${payment.amount.toLocaleString()} ${payment.currency}`

      const createdTime = new Date(payment.createdAt).getTime()
      const updatedTime = new Date(payment.updatedAt || payment.createdAt).getTime()

      // 1. Log payment creation
      entries.push({
        id: `c-${payment.id}`,
        type: 'invoice_created',
        title: 'Utworzono płatność',
        description: `Utworzono żądanie płatności dla ${vendorName} na kwotę ${formattedAmount} (${payment.method})`,
        date: new Date(payment.createdAt).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }),
        timestamp: createdTime,
        user: {
          name: 'Wedding Planner',
          initials: 'WP'
        }
      })

      // 2. Log confirmation / status updates
      if (payment.status === 'SUCCESS') {
        entries.push({
          id: `s-${payment.id}`,
          type: 'payment_confirmed',
          title: 'Opłacono online',
          description: `Zatwierdzono transakcję online dla ${vendorName} na kwotę ${formattedAmount}`,
          date: new Date(payment.approvedAt || payment.updatedAt).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }),
          timestamp: updatedTime,
          user: {
            name: 'Para Młoda',
            initials: 'PM'
          }
        })
      } else if (payment.status === 'OFFLINE_APPROVED') {
        entries.push({
          id: `a-${payment.id}`,
          type: 'payment_confirmed',
          title: 'Zatwierdzono offline',
          description: `Płatność gotówkowa dla ${vendorName} została zatwierdzona przez ${payment.approvedBy || 'ADMIN'}`,
          date: new Date(payment.approvedAt || payment.updatedAt).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }),
          timestamp: updatedTime,
          user: {
            name: payment.approvedBy || 'Wedding Planner',
            initials: (payment.approvedBy || 'WP').substring(0, 2).toUpperCase()
          }
        })
      } else if (payment.status === 'FAILED') {
        entries.push({
          id: `f-${payment.id}`,
          type: 'reminder_sent',
          title: 'Płatność nieudana',
          description: `Błąd bramki dla ${vendorName}: ${payment.failureReason || 'Brak środków'}`,
          date: new Date(payment.updatedAt).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }),
          timestamp: updatedTime,
          user: {
            name: 'System',
            initials: 'SYS'
          }
        })
      } else if (payment.status === 'CANCELLED') {
        entries.push({
          id: `x-${payment.id}`,
          type: 'reminder_sent',
          title: 'Anulowano płatność',
          description: `Płatność dla ${vendorName} została anulowana`,
          date: new Date(payment.updatedAt).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }),
          timestamp: updatedTime,
          user: {
            name: 'Użytkownik',
            initials: 'U'
          }
        })
      }
    })

    return entries.sort((a, b) => b.timestamp - a.timestamp)
  }, [payments, vendorsList])

  const handlePaymentAction = async (id: number, action: PaymentTableAction) => {
    if (action === 'pay-online') {
      setOnlinePaymentId(id)
      return
    }

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
      await loadDropdownData()
    } catch {
      setError('Nie udało się wykonać akcji płatności. Spróbuj ponownie.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleOnlinePaymentConfirm = async (success: boolean, reason?: string) => {
    if (!onlinePaymentId) return
    setIsGatewaySimulating(true)
    setError(null)

    const payment = payments.find(p => p.id === onlinePaymentId)
    const gatewayPaymentId = payment?.gatewayPaymentId ?? ''

    try {
      await confirmOnlinePayment(
        onlinePaymentId,
        {
          success,
          gatewayPaymentId,
          ...(reason && { failureReason: reason }),
        },
        { token: token ?? undefined }
      )

      showNotification(
        success
          ? 'Płatność online zakończona sukcesem.'
          : `Płatność nieudana: ${reason || 'Błąd bramki'}`,
        success ? 'success' : 'info'
      )
      setOnlinePaymentId(null)
      await loadPayments()
      await loadDropdownData()
    } catch {
      setError('Nie udało się potwierdzić płatności w bramce.')
    } finally {
      setIsGatewaySimulating(false)
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
      await loadDropdownData()
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
        <div className='app-alert app-alert-danger' style={{ textAlign: 'center' }}>
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
          <button onClick={handleExport} className='button-secondary'>
            <BudgetIcon name='file-text' color='var(--text)' size={18} />
            Eksportuj Raport
          </button>
          {userRole === 'planner' && (
            <button onClick={() => setIsCreateFormOpen((isOpen) => !isOpen)} className='button-primary'>
              Dodaj płatność
            </button>
          )}
        </div>
      </header>

      {isCreateFormOpen && userRole === 'planner' && (
        <section className='page-card' style={{ padding: '1.25rem', display: 'grid', gap: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Dodaj płatność</h2>
          </div>

          <form
            onSubmit={handleCreatePayment}
            style={{
              display: 'grid',
              gap: '1.25rem',
            }}
          >
            {/* Row 1: Wide selectors */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
            }}>
              <label style={{ display: 'grid', gap: '0.4rem', fontWeight: 600 }}>
                Wydatek / Zadanie
                <select
                  required
                  value={createPaymentForm.expenseId}
                  onChange={(event) => {
                    const selectedId = event.target.value
                    const exp = unpaidExpenses.find(e => e.id === Number(selectedId))
                    setCreatePaymentForm((form) => ({
                      ...form,
                      expenseId: selectedId,
                      amount: exp ? String(exp.amount) : form.amount,
                    }))
                  }}
                  style={{ padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
                >
                  <option value="">Wybierz wydatek...</option>
                  {unpaidExpenses.map(exp => (
                    <option key={exp.id} value={exp.id}>
                      {exp.description} ({exp.amount} PLN)
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'grid', gap: '0.4rem', fontWeight: 600 }}>
                Dostawca
                <select
                  required
                  value={createPaymentForm.vendorId}
                  onChange={(event) => setCreatePaymentForm((form) => ({ ...form, vendorId: event.target.value }))}
                  style={{ padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
                >
                  <option value="">Wybierz dostawcę...</option>
                  {vendorsList.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.companyName || `Dostawca #${v.id}`} ({v.serviceType})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Row 2: Short inputs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
            }}>
              <label style={{ display: 'grid', gap: '0.4rem', fontWeight: 600 }}>
                Kwota
                <input
                  type='number'
                  min='0.01'
                  step='0.01'
                  required
                  value={createPaymentForm.amount}
                  onChange={(event) => setCreatePaymentForm((form) => ({ ...form, amount: event.target.value }))}
                  style={{ padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '0.4rem', fontWeight: 600 }}>
                Metoda
                <select
                  value={createPaymentForm.method}
                  onChange={(event) => setCreatePaymentForm((form) => ({ ...form, method: event.target.value as PaymentMethod }))}
                  style={{ padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
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
                  style={{ padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
                />
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
              <button
                type='button'
                onClick={() => setIsCreateFormOpen(false)}
                disabled={isCreatingPayment}
                className='button-secondary'
                style={{ cursor: isCreatingPayment ? 'not-allowed' : 'pointer', minWidth: '100px' }}
              >
                Anuluj
              </button>
              <button
                type='submit'
                disabled={isCreatingPayment}
                className='button-primary'
                style={{ cursor: isCreatingPayment ? 'not-allowed' : 'pointer', opacity: isCreatingPayment ? 0.75 : 1, minWidth: '130px' }}
              >
                {isCreatingPayment ? 'Zapisywanie...' : 'Zapisz płatność'}
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
          title="Koszt zadań"
          value={`${stats.taskTotal.toLocaleString('pl-PL')} PLN`}
          color="#2f6db5"
          icon="wallet"
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

      <section className='page-card' style={{ padding: '1.25rem', display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Koszty zadań wydarzenia</h2>
            <p className='page-subtitle'>
              Suma kosztów zadań
            </p>
          </div>
          <div className='status-pill status-pill-info' style={{ padding: '0.7rem 1rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
            {isCostLoading ? 'Liczenie...' : `${costSummary.totalCost.toLocaleString('pl-PL')} PLN`}
          </div>
        </div>

        {!activeWeddingId && (
          <div className='surface-panel' style={{ padding: '1rem', color: 'var(--muted)' }}>
            Wybierz aktywne wydarzenie, aby zobaczyć koszty zadań.
          </div>
        )}

        {activeWeddingId && !token && (
          <div className='surface-panel' style={{ padding: '1rem', color: 'var(--muted)' }}>
            Podsumowanie kosztów zadań jest dostępne po zalogowaniu przez Google.
          </div>
        )}

        {costError && (
          <div className='app-alert app-alert-danger'>
            {costError}
          </div>
        )}

        {isCostLoading && (
          <div style={{ padding: '1rem', color: 'var(--muted)' }}>Ładowanie kosztów zadań...</div>
        )}

        {!isCostLoading && activeWeddingId && token && !costError && costSummary.tasks.length === 0 && (
          <div className='surface-panel' style={{ padding: '1rem', color: 'var(--muted)' }}>
            Brak zadań z wyliczalnym kosztem dla tego wydarzenia.
          </div>
        )}

        {!isCostLoading && costSummary.tasks.length > 0 && (
          <div className="budget-cost-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.7fr) minmax(260px, 0.9fr)', gap: '1rem', alignItems: 'start' }}>
            <div className='data-table-wrapper'>
              <table className='data-table'>
                <thead>
                  <tr>
                    <th style={{ padding: '0.8rem 0.75rem', color: 'var(--muted)', fontSize: '0.85rem' }}>Zadanie</th>
                    <th style={{ padding: '0.8rem 0.75rem', color: 'var(--muted)', fontSize: '0.85rem' }}>Typ</th>
                    <th style={{ padding: '0.8rem 0.75rem', color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'right' }}>Koszt</th>
                  </tr>
                </thead>
                <tbody>
                  {costSummary.tasks.map(task => (
                    <tr key={task.taskId}>
                      <td style={{ padding: '0.9rem 0.75rem', fontWeight: 650 }}>{task.taskName}</td>
                      <td style={{ padding: '0.9rem 0.75rem', color: 'var(--muted)' }}>{taskTypeLabels[task.taskType]}</td>
                      <td style={{ padding: '0.9rem 0.75rem', textAlign: 'right', fontWeight: 800, color: 'var(--info)' }}>
                        {task.cost.toLocaleString('pl-PL')} PLN
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {taskCostStats.map(stat => (
                <div key={stat.type} className='surface-panel' style={{ padding: '0.95rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontWeight: 700 }}>
                    <span>{stat.label}</span>
                    <span>{stat.amount.toLocaleString('pl-PL')} PLN</span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '999px', background: 'var(--border)', overflow: 'hidden', marginTop: '0.75rem' }}>
                    <div style={{ height: '100%', width: `${stat.percentage}%`, background: 'var(--info)' }} />
                  </div>
                  <div style={{ marginTop: '0.4rem', color: 'var(--muted)', fontSize: '0.85rem' }}>{stat.percentage}% kosztów zadań</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="budget-main-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2.5fr) minmax(300px, 1fr)',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        <section className='page-card' style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                  background: 'var(--surface)',
                  color: 'var(--text)'
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
                background: 'var(--surface)',
                color: 'var(--text)',
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
                userRole={userRole}
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
            <PaymentHistory history={generatedHistory} />
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

      {/* Sandbox Payment Gateway Modal */}
      {onlinePaymentId !== null && (() => {
        const payment = payments.find(p => p.id === onlinePaymentId)
        if (!payment) return null

        return (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(47, 42, 36, 0.65)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
            padding: '1rem'
          }}>
            <article className='page-card' style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '22px',
              padding: '2rem',
              width: 'min(440px, 100% - 2rem)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
              display: 'grid',
              gap: '1.25rem',
              animation: 'scaleUp 0.3s ease'
            }}>
              <header style={{ textAlign: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <span style={{ fontSize: '1.8rem' }}>💳</span>
                <h3 style={{ margin: '0.4rem 0 0', fontFamily: 'Georgia, serif', fontSize: '1.25rem' }}>
                  Bramka Płatnicza (Sandbox)
                </h3>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.85rem' }}>
                  Symulacja bezpiecznej płatności online
                </p>
              </header>

              {/* Mock Card design */}
              <div style={{
                background: 'linear-gradient(135deg, #1b2a2e 0%, #2f2a24 100%)',
                color: '#f8e1d2',
                padding: '1.25rem',
                borderRadius: '14px',
                display: 'grid',
                gap: '1.5rem',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'monospace' }}>SECURE PAY</span>
                  <span style={{ fontSize: '1.4rem' }}>🌸</span>
                </div>
                <div style={{ fontSize: '1.2rem', letterSpacing: '0.15em', fontFamily: 'monospace', textAlign: 'center', padding: '0.2rem 0' }}>
                  ••••  ••••  ••••  {1000 + (onlinePaymentId % 9000)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                  <div>
                    <div style={{ opacity: 0.7, fontSize: '0.6rem' }}>WŁAŚCICIEL</div>
                    <div>PARA MŁODA</div>
                  </div>
                  <div>
                    <div style={{ opacity: 0.7, fontSize: '0.6rem' }}>DATA WAŻN.</div>
                    <div>12 / 29</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '0.5rem', background: 'var(--surface-soft)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                {(() => {
                  const vendorObj = vendorsList.find(v => v.id === payment.vendorId)
                  const expenseObj = expensesList.find(e => e.id === payment.expenseId)
                  return (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--muted)' }}>Usługa / Wydatek:</span>
                        <strong>{expenseObj ? (expenseObj.description || `Wydatek #${payment.expenseId}`) : `Wydatek #${payment.expenseId}`}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--muted)' }}>Dla dostawcy:</span>
                        <strong>{vendorObj ? (vendorObj.companyName || `Dostawca #${payment.vendorId}`) : `Dostawca #${payment.vendorId}`}</strong>
                      </div>
                    </>
                  )
                })()}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 'bold', borderTop: '1px dashed var(--border)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                  <span>Do zapłaty:</span>
                  <span style={{ color: 'var(--primary)' }}>{payment.amount.toLocaleString()} {payment.currency}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <button
                  type="button"
                  disabled={isGatewaySimulating}
                  onClick={() => handleOnlinePaymentConfirm(true)}
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#35684f',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: isGatewaySimulating ? 'wait' : 'pointer',
                    boxShadow: '0 4px 12px rgba(53, 104, 79, 0.25)'
                  }}
                >
                  {isGatewaySimulating ? 'Autoryzacja...' : '✓ Zakończ Płatność Sukcesem'}
                </button>
                
                <button
                  type="button"
                  disabled={isGatewaySimulating}
                  onClick={() => handleOnlinePaymentConfirm(false, 'Brak wystarczających środków na koncie')}
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#c53030',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: isGatewaySimulating ? 'wait' : 'pointer',
                    boxShadow: '0 4px 12px rgba(197, 48, 48, 0.25)'
                  }}
                >
                  {isGatewaySimulating ? 'Autoryzacja...' : '✕ Symuluj Błąd (Brak Środków)'}
                </button>

                <button
                  type="button"
                  disabled={isGatewaySimulating}
                  onClick={() => setOnlinePaymentId(null)}
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    fontWeight: 600,
                    cursor: isGatewaySimulating ? 'wait' : 'pointer'
                  }}
                >
                  Anuluj i Wróć
                </button>
              </div>
            </article>
          </div>
        )
      })()}
    </div>
  )
}
