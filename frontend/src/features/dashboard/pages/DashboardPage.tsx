import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getEventCostSummary, type EventCostSummaryResponse } from '../../../api/eventCostApi'
import { getGuests, type GuestResponse } from '../../../api/guestApi'
import { getTasks, type TaskResponse } from '../../../api/taskApi'
import type { RootState } from '../../../store'
import { setActiveWeddingId } from '../../../store/slices/authSlice'

import { BudgetLegendItem } from '../components/BudgetLegendItem'
import { EventCard } from '../components/EventCard'
import { GuestStatCard } from '../components/GuestStatCard'
import { TopStatCard } from '../components/TopStatCard'
import type { BudgetItem, DashboardEvent, GuestStat, TopCardItem } from '../data/dashboardMock'
import { LandingPage } from '../../landing/pages/LandingPage'

const budgetColors = ['#d9a15f', '#dcc2ff', '#c9bca5', '#f5d9eb', '#f39bd0', '#8fc7b5']

function formatCurrency(value: number) {
  return `${value.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN`
}

function getCostValue(value: unknown) {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number(value) || 0
  return 0
}

function getTaskCost(task: TaskResponse) {
  if (task.totalPrice != null) return Number(task.totalPrice)
  if (task.pricePerGuest != null && task.numberOfGuests != null) {
    return Number(task.pricePerGuest) * Number(task.numberOfGuests)
  }
  return 0
}

function getDaysUntil(date: string) {
  if (!date) return null

  const target = new Date(`${date}T00:00:00`)
  if (Number.isNaN(target.getTime())) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function getGuestBucket(guest: GuestResponse) {
  const status = (guest.rsvpStatus ?? '').toUpperCase()

  if (['CONFIRMED', 'ACCEPTED', 'YES', 'POTWIERDZONY'].includes(status)) return 'confirmed'
  if (['REJECTED', 'DECLINED', 'NO', 'ODRZUCONY'].includes(status)) return 'rejected'
  return 'waiting'
}

function getTimelineStatus(task: TaskResponse) {
  if (task.status === 'COMPLETED') return 'Zrobione'
  if (task.priority != null && task.priority <= 1) return 'Wazne'
  if (task.status === 'IN_PROGRESS') return 'W trakcie'
  return 'Zaplanowane'
}

function getTaskDateParts(task: TaskResponse) {
  if (!task.dueDate) {
    return { date: 'Brak terminu', time: '-' }
  }

  const [date, rawTime] = task.dueDate.split('T')
  return {
    date: date || 'Brak terminu',
    time: rawTime?.slice(0, 5) || '-',
  }
}

export function DashboardPage() {
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const eventUpdated = searchParams.get('eventUpdated') === '1'

  // Redux state
  const { user, token, activeWeddingId, weddings, eventsLoading, eventsError } = useSelector((state: RootState) => state.auth)
  const activeWedding = weddings.find(w => w.id === activeWeddingId)
  const greetingName = user?.email?.split('@')[0] || 'Użytkownik'
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState<string | null>(null)
  const [costSummary, setCostSummary] = useState<EventCostSummaryResponse | null>(null)
  const [dashboardTasks, setDashboardTasks] = useState<TaskResponse[]>([])
  const [dashboardGuests, setDashboardGuests] = useState<GuestResponse[]>([])

  useEffect(() => {
    if (!activeWeddingId || !token) {
      return
    }

    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return

      setDashboardLoading(true)
      setDashboardError(null)

      Promise.all([
        getEventCostSummary(activeWeddingId, { token }),
        getTasks(activeWeddingId, { token }),
        getGuests(activeWeddingId, { token }),
      ])
        .then(([summary, tasks, guests]) => {
          if (cancelled) return
          setCostSummary(summary)
          setDashboardTasks(tasks)
          setDashboardGuests(guests)
        })
        .catch(() => {
          if (cancelled) return
          setDashboardError('Nie udało się pobrać kompletu danych pulpitu z backendu.')
          setCostSummary(null)
          setDashboardTasks([])
          setDashboardGuests([])
        })
        .finally(() => {
          if (!cancelled) setDashboardLoading(false)
        })
    })

    return () => {
      cancelled = true
    }
  }, [activeWeddingId, token])

  const budgetItems = useMemo<BudgetItem[]>(() => {
    const costTasks = costSummary?.tasks ?? []
    const groupedCosts = costTasks.reduce<Record<string, number>>((acc, task) => {
      const key = task.taskType || 'OTHER'
      acc[key] = (acc[key] ?? 0) + getCostValue(task.cost)
      return acc
    }, {})

    return Object.entries(groupedCosts)
      .filter(([, amount]) => amount > 0)
      .map(([type, amount], index) => ({
        id: type.toLowerCase(),
        name: type === 'CATERING' ? 'Catering' : type === 'DECORATION' ? 'Dekoracje' : type === 'ENTERTAINMENT' ? 'Rozrywka' : 'Inne',
        amount: formatCurrency(amount),
        color: budgetColors[index % budgetColors.length],
      }))
  }, [costSummary])

  const budgetGradient = useMemo(() => {
    const costTasks = costSummary?.tasks ?? []
    const groupedCosts = Object.values(costTasks.reduce<Record<string, number>>((acc, task) => {
      const key = task.taskType || 'OTHER'
      acc[key] = (acc[key] ?? 0) + getCostValue(task.cost)
      return acc
    }, {})).filter(amount => amount > 0)
    const total = groupedCosts.reduce((sum, amount) => sum + amount, 0)

    if (total <= 0) return 'conic-gradient(#efe4d7 0 100%)'

    let start = 0
    const segments = groupedCosts.map((amount, index) => {
      const end = start + (amount / total) * 100
      const segment = `${budgetColors[index % budgetColors.length]} ${start.toFixed(2)}% ${end.toFixed(2)}%`
      start = end
      return segment
    })

    return `conic-gradient(${segments.join(', ')})`
  }, [costSummary])

  const totalCost = getCostValue(costSummary?.totalCost)
  const taskTotalCost = dashboardTasks.reduce((sum, task) => sum + getTaskCost(task), 0)
  const visibleTotalCost = totalCost || taskTotalCost
  const completedTasks = dashboardTasks.filter(task => task.status === 'COMPLETED').length
  const guestBuckets = dashboardGuests.reduce(
    (acc, guest) => {
      acc[getGuestBucket(guest)] += 1
      return acc
    },
    { confirmed: 0, waiting: 0, rejected: 0 },
  )
  const allGuests = dashboardGuests.length
  const daysUntilWedding = getDaysUntil(activeWedding?.date ?? '')
  const guestConfirmationRate = allGuests > 0 ? Math.round((guestBuckets.confirmed / allGuests) * 100) : 0
  const taskProgressRate = dashboardTasks.length > 0 ? Math.round((completedTasks / dashboardTasks.length) * 100) : 0

  const topCards = useMemo<TopCardItem[]>(() => [
    {
      id: 'budget',
      title: 'Całkowity Budżet',
      value: visibleTotalCost > 0 ? formatCurrency(visibleTotalCost) : 'Brak kosztów',
      note: visibleTotalCost > 0 ? 'Wyliczone z zadań' : 'Dodaj koszty do zadań',
      color: 'var(--primary)',
      icon: 'trend',
    },
    {
      id: 'guests',
      title: 'Potwierdzeni Goście',
      value: `${guestBuckets.confirmed}/${allGuests}`,
      note: `${guestConfirmationRate}% potwierdzeń`,
      color: '#0ea44b',
      icon: 'users',
    },
    {
      id: 'tasks',
      title: 'Zadania Ukończone',
      value: `${completedTasks}/${dashboardTasks.length}`,
      note: `${taskProgressRate}% postępu`,
      color: '#2c67f6',
      icon: 'check',
    },
    {
      id: 'days',
      title: 'Dni do Ślubu',
      value: daysUntilWedding == null ? '-' : String(daysUntilWedding),
      note: activeWedding?.date || 'Brak daty wydarzenia',
      color: '#ff3d6c',
      icon: 'calendar',
    },
  ], [activeWedding?.date, allGuests, completedTasks, dashboardTasks.length, daysUntilWedding, guestBuckets.confirmed, guestConfirmationRate, taskProgressRate, visibleTotalCost])

  const timelineEvents = useMemo<DashboardEvent[]>(() => {
    return [...dashboardTasks]
      .filter(task => task.dueDate)
      .sort((first, second) => (first.dueDate ?? '').localeCompare(second.dueDate ?? ''))
      .slice(0, 4)
      .map((task) => {
        const { date, time } = getTaskDateParts(task)
        return {
          id: String(task.id),
          title: task.name,
          date,
          time,
          status: getTimelineStatus(task),
        }
      })
  }, [dashboardTasks])

  const guestStats = useMemo<GuestStat[]>(() => [
    { id: 'confirmed', value: String(guestBuckets.confirmed), label: 'Potwierdzeni', color: '#0ea44b', background: '#eefbf2', icon: 'check-circle' },
    { id: 'waiting', value: String(guestBuckets.waiting), label: 'Oczekujący', color: '#ef8a00', background: 'var(--surface)', icon: 'clock' },
    { id: 'rejected', value: String(guestBuckets.rejected), label: 'Odrzuceni', color: '#eb1d1d', background: 'var(--surface)', icon: 'alert' },
    { id: 'all', value: String(allGuests), label: 'Suma', color: 'var(--primary)', background: 'var(--surface)', icon: 'group' },
  ], [allGuests, guestBuckets.confirmed, guestBuckets.rejected, guestBuckets.waiting])

  // ----------------------------------------------------
  // CASE 1: NOT LOGGED IN - PUBLIC LANDING PAGE
  // ----------------------------------------------------
  if (!user) {
    return <LandingPage />
  }

  // ----------------------------------------------------
  // CASE 2: ZALOGOWANY WEDDING PLANNER
  // ----------------------------------------------------
  if (!token) {
    return (
      <section className='page-card' style={{ maxWidth: '680px', margin: '3rem auto', padding: '2rem', textAlign: 'center' }}>
        <h1 className='page-title'>Tryb demonstracyjny</h1>
        <p className='page-subtitle'>Dane wydarzeń z backendu są dostępne po zalogowaniu przez Google.</p>
        <Link to='/auth' style={{ color: 'var(--primary)', fontWeight: 600 }}>
          Przejdź do logowania
        </Link>
      </section>
    )
  }

  if (eventsLoading) {
    return (
      <section className='page-card' style={{ maxWidth: '680px', margin: '3rem auto', padding: '2rem', textAlign: 'center' }}>
        <h1 className='page-title'>Ładowanie wydarzeń...</h1>
        <p className='page-subtitle'>Pobieramy aktualną listę wydarzeń z backendu.</p>
      </section>
    )
  }

  if (eventsError) {
    return (
      <section className='page-card' style={{ maxWidth: '680px', margin: '3rem auto', padding: '2rem', textAlign: 'center' }}>
        <h1 className='page-title'>Nie udało się pobrać wydarzeń</h1>
        <p className='page-subtitle'>{eventsError}</p>
      </section>
    )
  }

  if (user.role === 'planner') {
    
    // If planner has already selected a wedding, we render the wedding details!
    if (activeWedding) {
      return renderActiveWeddingDashboard()
    }

    // Otherwise, render the beautiful Planner Event Selector!
    return (
      <section style={{ display: 'grid', gap: '2rem' }}>
        
        {/* Banner powitalny */}
        <article className="page-card" style={{
          padding: '2rem',
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-soft) 100%)',
          border: '1px solid var(--border)',
          borderRadius: '16px'
        }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--primary)', fontWeight: 600 }}>Dedykowany Panel Plannera</span>
          <h1 className="page-title" style={{ fontSize: '2.2rem', marginTop: '0.25rem', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 400 }}>
            Witaj, {greetingName}!
          </h1>
          <p className="page-subtitle" style={{ fontSize: '1.05rem', color: 'var(--muted)', margin: '0.4rem 0 0' }}>
            Oto lista wesel, które aktualnie koordynujesz. Wybierz wesele, aby przejść do szczegółów.
          </p>
        </article>

        {/* Lista Wesel w postaci luksusowych kart */}
        {weddings.length === 0 && (
          <article className='page-card' style={{ padding: '2rem', textAlign: 'center' }}>
            <h2 style={{ marginTop: 0 }}>Brak wydarzeń</h2>
            <p style={{ color: 'var(--muted)' }}>Backend nie zwrócił jeszcze żadnego wydarzenia.</p>
            <Link to='/events/new' style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Utwórz pierwsze wydarzenie
            </Link>
          </article>
        )}
        <div className="wedding-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {weddings.map((wedding) => (
            <div 
              key={wedding.id}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '2rem 1.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(47, 42, 36, 0.06)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: '1.35rem', fontWeight: 500 }}>
                    {wedding.name}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginTop: '0.2rem' }}>
                    📅 {wedding.date}
                  </span>
                </div>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  background: 'var(--primary-soft)',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  fontSize: '0.78rem'
                }}>
                  {wedding.status}
                </span>
              </div>

              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Lokalizacja wesela:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>🏰 {wedding.venue}</span>
              </div>

              <button
                onClick={() => dispatch(setActiveWeddingId(wedding.id))}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'var(--primary)',
                  color: 'var(--on-primary)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(184, 90, 31, 0.15)',
                  transition: 'background 0.2s'
                }}
              >
                Zarządzaj Weselem
              </button>
            </div>
          ))}
        </div>
      </section>
    )
  }

  // ----------------------------------------------------
  // CASE 3: ZALOGOWANA PARA MŁODA
  // ----------------------------------------------------
  if (user.role === 'couple') {
    
    // Case 3a: No active wedding created yet
    if (!activeWeddingId) {
      return (
        <section style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', display: 'grid', gap: '1.5rem' }}>
          <div style={{ fontSize: '4.5rem', lineHeight: 1 }}>💍</div>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--primary)', fontWeight: 600 }}>Witaj w planerze</span>
          
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2.5rem', margin: 0, fontWeight: 500 }}>
            Witaj, {greetingName}!
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: '1.6', margin: 0 }}>
            Cieszymy się, że jesteś z nami. Twój luksusowy planer ślubny jest gotowy do wdrożenia. 
            Stwórzmy teraz Twoje pierwsze wydarzenie, aby odblokować pełen pakiet narzędzi.
          </p>
          
          <div style={{ marginTop: '1.5rem' }}>
            <Link 
              to="/events/new"
              style={{
                display: 'inline-block',
                padding: '0.9rem 2.5rem',
                borderRadius: '999px',
                background: 'var(--primary)',
                color: 'var(--on-primary)',
                fontWeight: 700,
                fontSize: '1.05rem',
                boxShadow: '0 6px 22px rgba(184, 90, 31, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              Rozpocznij Kreator Wesela ✨
            </Link>
          </div>
        </section>
      )
    }

    // Case 3b: Has active wedding! Render active dashboard
    return renderActiveWeddingDashboard()
  }

  return null

  // ----------------------------------------------------
  // HELPER METHOD: ACTIVE DASHBOARD RENDERER
  // ----------------------------------------------------
  function renderActiveWeddingDashboard() {
    if (!activeWedding) return null;

    return (
      <section style={{ display: 'grid', gap: '1rem' }}>
        {eventUpdated && (
          <div className='app-alert app-alert-success'>
            Szczegóły wydarzenia zostały zapisane.
          </div>
        )}
        {dashboardLoading && (
          <div className='app-alert app-alert-info'>
            Odświeżamy dane pulpitu z backendu...
          </div>
        )}
        {dashboardError && (
          <div className='app-alert app-alert-danger'>
            {dashboardError}
          </div>
        )}
        
        {/* Dynamic Header Panel */}
        <article
          className='page-card'
          style={{
            padding: '1.6rem',
            background: 'linear-gradient(180deg, var(--surface) 0%, var(--surface-soft) 100%)',
          }}
        >
          <div
            className='dashboard-header-row'
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1rem',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h1 className='page-title' style={{ fontSize: '2rem' }}>
                {user?.role === 'planner' ? 'Pulpit Menadżera (Koordynator)' : 'Twój Pulpit Ślubny'}
              </h1>
              <p className='page-subtitle' style={{ fontSize: '1.05rem' }}>
                Witaj, {greetingName}! Oto przegląd planowania wesela.
              </p>
            </div>

            <div className='dashboard-event-summary' style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Ślub i Wesele
              </p>
              <strong style={{ fontSize: '1.8rem', fontFamily: 'Georgia, serif', fontWeight: 500 }}>
                {activeWedding.name}
              </strong>
              <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                📅 {activeWedding.date} | 🏰 {activeWedding.venue}
              </span>
              <Link
                to={`/events/${activeWedding.id}/edit`}
                style={{
                  display: 'inline-block',
                  marginTop: '0.8rem',
                  padding: '0.55rem 1rem',
                  borderRadius: '9px',
                  background: 'var(--primary)',
                  color: 'var(--on-primary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                Edytuj szczegóły
              </Link>
            </div>
          </div>
        </article>

        {/* Dynamic stats cards based on current activeWedding state */}
        <div className='stats-grid' style={{ marginTop: 0 }}>
          {topCards.map((card) => {
            return (
              <TopStatCard
                key={card.id}
                title={card.title}
                value={card.value}
                note={card.note}
                color={card.color}
                icon={card.icon}
              />
            )
          })}
        </div>

        {/* Interactive panels: Budget Pie & Schedule */}
        <div
          className='dashboard-main-grid'
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 0.9fr) minmax(320px, 1.7fr)',
            gap: '1rem',
          }}
        >
          {/* Budget chart simulation */}
          <article className='page-card' style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.2rem 1.35rem', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Podsumowanie Budżetu</h2>
            </div>

            <div style={{ padding: '1.4rem 1.35rem' }}>
              <div
                style={{
                  width: '220px',
                  height: '220px',
                  margin: '0 auto 1.4rem',
                  borderRadius: '50%',
                  background: budgetGradient,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: '24px',
                    borderRadius: '50%',
                    background: 'var(--surface)',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gap: '0.9rem' }}>
                {budgetItems.map((item) => (
                  <BudgetLegendItem
                    key={item.id}
                    name={item.name}
                    amount={item.amount}
                    color={item.color}
                  />
                ))}
              </div>

              <div
                style={{
                  marginTop: '1.4rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  alignItems: 'center',
                }}
              >
                <strong style={{ fontSize: '1rem' }}>Suma całkowita</strong>
                <strong style={{ color: 'var(--primary)', fontSize: '1.8rem' }}>
                  {visibleTotalCost > 0 ? formatCurrency(visibleTotalCost) : '0 PLN'}
                </strong>
              </div>
            </div>
          </article>

          {/* Timeline details */}
          <article className='page-card' style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.2rem 1.35rem', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Najbliższe Wydarzenia i Kamienie Milowe</h2>
            </div>

            <div style={{ padding: '1.35rem', display: 'grid', gap: '1rem' }}>
              {timelineEvents.map((event) => (
                <EventCard
                  key={event.id}
                  {...event}
                />
              ))}
              {timelineEvents.length === 0 && (
                <div className='surface-panel' style={{ padding: '1rem', color: 'var(--muted)', textAlign: 'center' }}>
                  Brak zadań z terminem dla aktywnego wydarzenia.
                </div>
              )}
            </div>
          </article>
        </div>

        {/* Guest count details */}
        <article className='page-card' style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.2rem 1.35rem', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Statystyki Gości</h2>
          </div>

          <div
            className='guest-stats-grid'
            style={{
              padding: '1.35rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
            }}
          >
            {guestStats.map((item) => (
              <GuestStatCard
                key={item.id}
                {...item}
              />
            ))}
          </div>
        </article>
      </section>
    )
  }
}
