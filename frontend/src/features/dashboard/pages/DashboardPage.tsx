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
  const currentTab = searchParams.get('tab') || 'about'
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

  // Hover states for the active dashboard
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [hoveredBudgetItem, setHoveredBudgetItem] = useState<string | null>(null)
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)
  const [hoveredGuestStat, setHoveredGuestStat] = useState<string | null>(null)

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
      color: '#d6a061',
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
    { id: 'waiting', value: String(guestBuckets.waiting), label: 'Oczekujący', color: '#ef8a00', background: '#fff9e9', icon: 'clock' },
    { id: 'rejected', value: String(guestBuckets.rejected), label: 'Odrzuceni', color: '#eb1d1d', background: '#fff3f3', icon: 'alert' },
    { id: 'all', value: String(allGuests), label: 'Suma', color: '#d6a061', background: '#fcf7f0', icon: 'group' },
  ], [allGuests, guestBuckets.confirmed, guestBuckets.rejected, guestBuckets.waiting])

  // ----------------------------------------------------
  // CASE 1: NOT LOGGED IN - PUBLIC LANDING PAGE
  // ----------------------------------------------------
  if (!user) {
    return (
      <div style={{ display: 'grid', gap: '2.5rem' }}>
        
        {/* Luxury Hero Banner */}
        <section style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #fffcf6 0%, #f7f1e5 50%, #efe7dc 100%)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '3rem', opacity: 0.1 }}>🌸</div>
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '3rem', opacity: 0.1 }}>🌸</div>
          
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--primary)', fontWeight: 600 }}>
            Witaj w Wedding Planner
          </span>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '3rem',
            margin: '0.75rem 0',
            fontWeight: 400,
            lineHeight: 1.2,
            color: 'var(--text)'
          }}>
            Planuj Swój Wymarzony Ślub <br />z Lekkością i Klasą
          </h1>
          <p style={{ maxWidth: '600px', margin: '1rem auto 2rem', color: 'var(--muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Interaktywne zarządzanie gośćmi, budżetem, dostawcami oraz cateringiem w jednym, luksusowym i intuicyjnym systemie.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/auth" style={{
              padding: '0.8rem 2rem',
              borderRadius: '999px',
              background: 'var(--primary)',
              color: '#fff',
              fontWeight: 600,
              boxShadow: '0 6px 20px rgba(184, 90, 31, 0.2)'
            }}>
              Rozpocznij Bezpłatnie
            </Link>
            <Link to="/rsvp" style={{
              padding: '0.8rem 2rem',
              borderRadius: '999px',
              background: '#fff',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              fontWeight: 600
            }}>
              Potwierdź RSVP Gościa
            </Link>
          </div>
        </section>

        {/* Tab-based Content Section */}
        <section className="page-card" style={{ padding: '2.5rem' }}>
          
          {/* TAB ABOUT */}
          {currentTab === 'about' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
              <div>
                <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>O Aplikacji</span>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2rem', margin: '0.5rem 0 1rem', fontWeight: 400 }}>Kim Jesteśmy?</h2>
                <p style={{ color: 'var(--muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                  Wedding Planner to ekskluzywne oprogramowanie stworzone z myślą o parach młodych oraz profesjonalnych konsultantach ślubnych (Wedding Planners). 
                  Rozumiemy, że organizacja ślubu wymaga dbałości o każdy, nawet najmniejszy detal.
                </p>
                <p style={{ color: 'var(--muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                  Nasz system gromadzi wszystkie kluczowe elementy – harmonogramy, budżet ślubny, zadania, catering oraz listę gości – w jednym spójnym interfejsie klasy Premium.
                </p>
              </div>
              <div style={{ background: 'var(--bg-accent)', padding: '2rem', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontFamily: 'Georgia, serif', fontWeight: 500 }}>Dlaczego nasz system?</h3>
                <ul style={{ paddingLeft: '1.2rem', display: 'grid', gap: '0.75rem', color: 'var(--text)', fontSize: '0.9rem' }}>
                  <li>✨ <strong>Elegancja i Styl:</strong> Przepiękny interfejs ułatwiający planowanie.</li>
                  <li>📊 <strong>Pełna Kontrola Budżetu:</strong> Śledzenie zaliczek, płatności i faktur dostawców.</li>
                  <li>👥 <strong>RSVP Online:</strong> Bezpośrednia integracja odpowiedzi gości z Twoją listą.</li>
                  <li>💼 <strong>Dla Profesjonalistów:</strong> Dedykowany pulpit do zarządzania wieloma weselami na raz.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB SERVICES */}
          {currentTab === 'services' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Funkcjonalności</span>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2rem', margin: '0.5rem 0 0.5rem', fontWeight: 400 }}>Nasza Oferta Premium</h2>
                <p style={{ color: 'var(--muted)', margin: 0 }}>Poznaj narzędzia, które zaoszczędzą Ci setki godzin stresu.</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div style={{ border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '12px', background: '#fff' }}>
                  <span style={{ fontSize: '2rem' }}>📅</span>
                  <h3 style={{ margin: '0.75rem 0 0.5rem', fontSize: '1.15rem' }}>Interaktywny Harmonogram</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>Planuj kamienie milowe, twórz listy zadań i przypomnienia, które ułatwią terminową realizację.</p>
                </div>
                <div style={{ border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '12px', background: '#fff' }}>
                  <span style={{ fontSize: '2rem' }}>💰</span>
                  <h3 style={{ margin: '0.75rem 0 0.5rem', fontSize: '1.15rem' }}>Inteligentny Budżet</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>Automatyczne podsumowania opłat, kontrola zaległych płatności oraz faktur dla wszystkich usługodawców.</p>
                </div>
                <div style={{ border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '12px', background: '#fff' }}>
                  <span style={{ fontSize: '2rem' }}>🍷</span>
                  <h3 style={{ margin: '0.75rem 0 0.5rem', fontSize: '1.15rem' }}>Goście i RSVP</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>Zarządzanie stolikami, menu weselnym, alergiami i bezpośredni publiczny panel RSVP dla Twoich gości.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB GALLERY */}
          {currentTab === 'gallery' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Inspiracje</span>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2rem', margin: '0.5rem 0 0.5rem', fontWeight: 400 }}>Najpiękniejsze Realizacje</h2>
                <p style={{ color: 'var(--muted)', margin: 0 }}>Przegląd stylów weselnych zrealizowanych za pomocą naszego planera.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {[
                  { name: 'Wesele Rustykalne w Stodole', style: 'Rustykalny', icon: '🪵' },
                  { name: 'Ślub Glamour w Złotym Dworze', style: 'Glamour', icon: '✨' },
                  { name: 'Letnie Przyjęcie Boho w Ogrodzie', style: 'Boho', icon: '🌾' },
                  { name: 'Klasyczna Elegancja w Pałacu', style: 'Klasyczny', icon: '🌹' }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    padding: '2rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    textAlign: 'center',
                    background: 'linear-gradient(to bottom, #fffdf9, #fff)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{ fontSize: '2.5rem' }}>{item.icon}</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text)' }}>{item.name}</strong>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '20px', background: 'var(--primary-soft)', color: 'var(--primary)', fontWeight: 600 }}>{item.style}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTACT */}
          {currentTab === 'contact' && (
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Kontakt</span>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2rem', margin: '0.5rem 0 0.5rem', fontWeight: 400 }}>Porozmawiajmy o Twoim Ślubie</h2>
                <p style={{ color: 'var(--muted)', margin: 0 }}>Masz pytania dotyczące planera lub oferty dla plannera? Napisz do nas!</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); alert('Dziękujemy! Skontaktujemy się wkrótce.'); }} style={{ display: 'grid', gap: '1rem' }}>
                <input 
                  type="text" 
                  placeholder="Twoje Imię" 
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
                />
                <input 
                  type="email" 
                  placeholder="Adres E-mail" 
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
                />
                <textarea 
                  rows={4} 
                  placeholder="Treść Twojej wiadomości..." 
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', resize: 'vertical' }}
                />
                <button type="submit" style={{ padding: '0.8rem', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                  Wyślij Wiadomość
                </button>
              </form>
            </div>
          )}

        </section>
      </div>
    )
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
          background: 'linear-gradient(135deg, #fffdf9 0%, #fff8f1 100%)',
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {weddings.map((wedding) => (
            <div 
              key={wedding.id}
              style={{
                background: '#fff',
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
                  color: '#fff',
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
                color: '#fff',
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
          <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', background: '#edf9f0', color: '#276738', border: '1px solid #ccebd4' }}>
            Szczegóły wydarzenia zostały zapisane.
          </div>
        )}
        {dashboardLoading && (
          <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', background: '#fff8ed', color: '#8c5a12', border: '1px solid #f4da8b' }}>
            Odświeżamy dane pulpitu z backendu...
          </div>
        )}
        {dashboardError && (
          <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', background: '#fff2f2', color: '#c53030', border: '1px solid #f4c1c1' }}>
            {dashboardError}
          </div>
        )}
        
        {/* Dynamic Header Panel */}
        <article
          className='page-card'
          style={{
            padding: '1.6rem',
            background: 'linear-gradient(180deg, #fffdf9 0%, #fff8f1 100%)',
          }}
        >
          <div
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

            <div style={{ textAlign: 'right' }}>
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
                  color: '#fff',
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
                isHovered={hoveredCard === card.id}
                onHoverStart={() => setHoveredCard(card.id)}
                onHoverEnd={() => setHoveredCard(null)}
              />
            )
          })}
        </div>

        {/* Interactive panels: Budget Pie & Schedule */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 0.9fr) minmax(320px, 1.7fr)',
            gap: '1rem',
          }}
        >
          {/* Budget chart simulation */}
          <article className='page-card' style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.2rem 1.35rem', borderBottom: '1px solid #f1e8dc' }}>
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
                    background: '#fff',
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
                    isHovered={hoveredBudgetItem === item.id}
                    onHoverStart={() => setHoveredBudgetItem(item.id)}
                    onHoverEnd={() => setHoveredBudgetItem(null)}
                  />
                ))}
              </div>

              <div
                style={{
                  marginTop: '1.4rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #f1e8dc',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  alignItems: 'center',
                }}
              >
                <strong style={{ fontSize: '1rem' }}>Suma całkowita</strong>
                <strong style={{ color: '#d6a061', fontSize: '1.8rem' }}>
                  {visibleTotalCost > 0 ? formatCurrency(visibleTotalCost) : '0 PLN'}
                </strong>
              </div>
            </div>
          </article>

          {/* Timeline details */}
          <article className='page-card' style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.2rem 1.35rem', borderBottom: '1px solid #f1e8dc' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Najbliższe Wydarzenia i Kamienie Milowe</h2>
            </div>

            <div style={{ padding: '1.35rem', display: 'grid', gap: '1rem' }}>
              {timelineEvents.map((event) => (
                <EventCard
                  key={event.id}
                  {...event}
                  isHovered={hoveredEvent === event.id}
                  onHoverStart={() => setHoveredEvent(event.id)}
                  onHoverEnd={() => setHoveredEvent(null)}
                />
              ))}
              {timelineEvents.length === 0 && (
                <div style={{ padding: '1rem', borderRadius: '12px', background: '#fffdfa', color: 'var(--muted)', border: '1px solid #f2e6d8', textAlign: 'center' }}>
                  Brak zadań z terminem dla aktywnego wydarzenia.
                </div>
              )}
            </div>
          </article>
        </div>

        {/* Guest count details */}
        <article className='page-card' style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.2rem 1.35rem', borderBottom: '1px solid #f1e8dc' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Statystyki Gości</h2>
          </div>

          <div
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
                isHovered={hoveredGuestStat === item.id}
                onHoverStart={() => setHoveredGuestStat(item.id)}
                onHoverEnd={() => setHoveredGuestStat(null)}
              />
            ))}
          </div>
        </article>
      </section>
    )
  }
}
