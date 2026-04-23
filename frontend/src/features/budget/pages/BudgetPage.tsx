import { useState, useMemo } from 'react'
import { BudgetStatCard } from '../components/BudgetStatCard'
import { PaymentTable } from '../components/PaymentTable'
import { PaymentHistory } from '../components/PaymentHistory'
import { BudgetSummary } from '../components/BudgetSummary'
import { BudgetIcon } from '../components/BudgetIcon'
import { history as initialHistory, payments as initialPayments } from '../data/budgetMock'

export function BudgetPage() {
  const [payments, setPayments] = useState(initialPayments)
  const [history, setHistory] = useState(initialHistory)
  const [filter, setFilter] = useState('all')

  const stats = useMemo(() => {
    const total = payments.reduce((acc, p) => acc + p.amount, 0)
    const paid = payments.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0)
    const pending = payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0)
    const overdue = payments.filter(p => p.status === 'overdue').reduce((acc, p) => acc + p.amount, 0)
    const paidCount = payments.filter(p => p.status === 'paid').length
    const totalCount = payments.length

    return { total, paid, pending, overdue, paidCount, totalCount }
  }, [payments])

  const filteredPayments = useMemo(() => {
    if (filter === 'all') return payments
    return payments.filter(p => {
      if (filter === 'paid') return p.status === 'paid'
      if (filter === 'pending') return p.status === 'pending'
      if (filter === 'overdue') return p.status === 'overdue'
      return true
    })
  }, [payments, filter])

  const handlePay = (id: string) => {
    const payment = payments.find(p => p.id === id)
    if (!payment) return

    setPayments(prev => prev.map(p => 
      p.id === id ? { ...p, status: 'paid', paidAt: new Date().toISOString().split('T')[0] } : p
    ))

    const newHistoryEntry = {
      id: `h-${Date.now()}`,
      type: 'payment_confirmed' as const,
      title: 'Zatwierdzono płatność',
      description: `Płatność dla ${payment.vendor} (${payment.service}) została zatwierdzona.`,
      date: new Date().toLocaleString('pl-PL', { hour12: false }).replace(',', ''),
      user: { name: 'Anna Kowalska', initials: 'AK' }
    }
    setHistory(prev => [newHistoryEntry, ...prev])
  }

  const handleExport = () => {
    alert('Raport został wygenerowany i pobrany pomyślnie!')
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className='page-title'>Panel Płatności</h1>
          <p className='page-subtitle'>Zarządzaj płatnościami dostawców i śledź faktury</p>
        </div>
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
      </header>

      <div className='stats-grid'>
        <BudgetStatCard 
          title="Budżet Całkowity" 
          value={`${stats.total.toLocaleString()} PLN`} 
          color="#b85a1f" 
          icon="trend" 
        />
        <BudgetStatCard 
          title="Opłacono" 
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
          title="Zaległe" 
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
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Lista Płatności</h2>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ 
                  padding: '0.4rem 0.75rem', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border)', 
                  fontSize: '0.85rem',
                  background: '#fff'
                }}
              >
                <option value="all">Wszystkie statusy</option>
                <option value="paid">Opłacono</option>
                <option value="pending">Oczekuje</option>
                <option value="overdue">Zaległe</option>
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
            <PaymentTable payments={filteredPayments} onPay={handlePay} />
          </div>
        </section>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <section className='page-card' style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <BudgetIcon name='history' color='var(--primary)' size={20} />
              <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Historia Zmian</h2>
            </div>
            <PaymentHistory history={history} />
          </section>

          <section className='page-card' style={{ padding: '1.25rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', marginBottom: '1.25rem' }}>Podsumowanie</h2>
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
