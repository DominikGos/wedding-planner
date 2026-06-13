import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { CalendarGrid } from '../components/CalendarGrid'
import { EventIcon } from '../components/EventIcon'
import { FilterTab } from '../components/FilterTab'
import { ReminderItem } from '../components/ReminderItem'
import { TimelineCard } from '../components/TimelineCard'
import {
  filterTabs,
  initialReminders,
  initialTimelineItems,
  tabToSubtitleMap,
  type TimelineItem,
} from '../data/eventsMock'

const monthNamesPL = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
]

const generateCalendarGrid = (year: number, monthIndex: number): string[][] => {
  const firstDayOfMonth = new Date(year, monthIndex, 1)
  let startDayOfWeek = firstDayOfMonth.getDay()
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate()

  const days: string[] = []

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push(String(daysInPrevMonth - i))
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(String(i))
  }

  const remainingCells = 42 - days.length
  for (let i = 1; i <= remainingCells; i++) {
    days.push(String(i))
  }

  const rows: string[][] = []
  for (let i = 0; i < 42; i += 7) {
    rows.push(days.slice(i, i + 7))
  }
  return rows
}

export function EventsPage() {
  const navigate = useNavigate()

  const [selectedItem, setSelectedItem] = useState<string>('task-1')
  const [selectedReminder, setSelectedReminder] = useState<string>(initialReminders[0].id)
  const [showRemindersModal, setShowRemindersModal] = useState(false)
  const [activeDate, setActiveDate] = useState('25')
  const [filterByCalendarDay, setFilterByCalendarDay] = useState(false)
  
  const [currentYear, setCurrentYear] = useState(2026)
  const [currentMonthIndex, setCurrentMonthIndex] = useState(2) // March

  const calendarRows = useMemo(() => {
    return generateCalendarGrid(currentYear, currentMonthIndex)
  }, [currentYear, currentMonthIndex])

  const handlePrevMonth = () => {
    setFilterByCalendarDay(false)
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11)
      setCurrentYear(prev => prev - 1)
    } else {
      setCurrentMonthIndex(prev => prev - 1)
    }
  }

  const handleNextMonth = () => {
    setFilterByCalendarDay(false)
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0)
      setCurrentYear(prev => prev + 1)
    } else {
      setCurrentMonthIndex(prev => prev + 1)
    }
  }

  const [showAll, setShowAll] = useState(false)
  const [formState, setFormState] = useState({
    tab: 'Wszystkie',
    category: 'Wszystkie kategorie',
  })

  // Filter based on tabs & category
  const visibleEvents = useMemo(() => {
    return initialTimelineItems.filter((item: TimelineItem) => {
      const selectedSubtitle = tabToSubtitleMap[formState.tab]
      const matchesTab = selectedSubtitle === null || item.subtitle === selectedSubtitle
      const matchesCategory =
        formState.category === 'Wszystkie kategorie' || item.category === formState.category
      
      const selectedDateString = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(activeDate).padStart(2, '0')}`
      const matchesCalendar = !filterByCalendarDay || item.date === selectedDateString
      
      return matchesTab && matchesCategory && matchesCalendar
    })
  }, [formState.category, formState.tab, filterByCalendarDay, activeDate, currentYear, currentMonthIndex])

  const displayedEvents = showAll ? visibleEvents : visibleEvents.slice(0, 5)

  const handleAddNewEvent = () => {
    navigate('/tasks', { state: { openForm: true } })
  }

  return (
    <section style={{ display: 'grid', gap: '1rem' }}>
      <article
        className='page-card'
        style={{
          padding: '1.6rem',
          background: 'linear-gradient(180deg, #fffdf9 0%, #fff8f1 100%)',
        }}
      >
        <h1 className='page-title' style={{ fontSize: '2rem' }}>
          Harmonogram przygotowań
        </h1>
        <p className='page-subtitle' style={{ fontSize: '1.05rem' }}>
          Zobacz plan przygotowań do ślubu i nadchodzące kamienie milowe.
        </p>
      </article>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.9fr) minmax(260px, 0.75fr)',
          gap: '1rem',
          alignItems: 'start',
        }}
      >
        <article className='page-card' style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              padding: '1.15rem 1.2rem',
              borderBottom: '1px solid #f1e8dc',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1rem',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {filterTabs.map((tab) => (
                <FilterTab
                  key={tab}
                  label={tab}
                  active={formState.tab === tab}
                  onClick={() =>
                    setFormState((current) => ({
                      ...current,
                      tab,
                    }))
                  }
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
              <select
                value={formState.category}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
                style={{
                  minHeight: '44px',
                  border: '1px solid #efe1d0',
                  borderRadius: '12px',
                  background: '#fffdfa',
                  padding: '0 0.9rem',
                  color: 'var(--muted)',
                  minWidth: '190px',
                }}
              >
                <option>Wszystkie kategorie</option>
                <option>Catering</option>
                <option>Dekoracje</option>
                <option>Fotografia</option>
                <option>Muzyka</option>
              </select>

              <button
                type='button'
                onClick={() =>
                  setFormState((current) => ({
                    ...current,
                    category: current.category === 'Wszystkie kategorie' ? 'Catering' : 'Wszystkie kategorie',
                  }))
                }
                style={{
                  minHeight: '44px',
                  border: '1px solid #efe1d0',
                  borderRadius: '12px',
                  background: '#fffdfa',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0 0.9rem',
                  cursor: 'pointer',
                }}
              >
                <EventIcon name='filter' color='var(--muted)' size={16} />
                <span>Filtry</span>
              </button>
            </div>
          </div>

          <div style={{ padding: '1.2rem', display: 'grid', gap: '1rem' }}>
            {filterByCalendarDay && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.65rem 0.95rem',
                borderRadius: '10px',
                background: '#fff8f1',
                border: '1px solid #efe1d0',
                fontSize: '0.88rem',
                color: '#db7e45',
                fontWeight: 600,
                animation: 'fadeIn 0.25s ease'
              }}>
                <span>📅 Wyświetlasz tylko wydarzenia na dzień: {activeDate} {monthNamesPL[currentMonthIndex]} {currentYear}</span>
                <button
                  type="button"
                  onClick={() => setFilterByCalendarDay(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#db7e45',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Pokaż wszystkie dni
                </button>
              </div>
            )}
            {displayedEvents.map((item: TimelineItem) => (
              <TimelineCard
                key={item.id}
                item={item}
                isSelected={selectedItem === item.id}
                onClick={() => {
                  setSelectedItem(item.id)
                  setActiveDate(item.day)
                  console.log('events:select', item.id)
                }}
              />
            ))}

            {visibleEvents.length > 5 && (
              <button
                type='button'
                onClick={() => setShowAll((current) => !current)}
                style={{
                  textAlign: 'center',
                  paddingTop: '0.35rem',
                  color: 'var(--muted)',
                  fontWeight: 600,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                {showAll ? 'Pokaż mniej' : 'Pokaż więcej'}
              </button>
            )}

            {visibleEvents.length === 0 && (
              <div style={{ padding: '2rem 1rem', color: 'var(--muted)', textAlign: 'center', display: 'grid', gap: '0.75rem' }}>
                <span>
                  {filterByCalendarDay 
                    ? `Brak zaplanowanych wydarzeń na dzień ${activeDate} ${monthNamesPL[currentMonthIndex]} ${currentYear}.`
                    : 'Brak zadań w wybranej kategorii.'}
                </span>
                {filterByCalendarDay && (
                  <button
                    type="button"
                    onClick={() => setFilterByCalendarDay(false)}
                    style={{
                      margin: '0 auto',
                      padding: '0.45rem 0.95rem',
                      borderRadius: '8px',
                      border: '1px solid #d6a061',
                      background: '#fff',
                      color: '#d6a061',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Pokaż cały harmonogram
                  </button>
                )}
              </div>
            )}
          </div>
        </article>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <article className='page-card' style={{ padding: '1.2rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Kalendarz</h2>

            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <button 
                type='button' 
                onClick={handlePrevMonth}
                style={{ border: 'none', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', padding: '0 0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}
              >
                {'<'}
              </button>
              <strong>{monthNamesPL[currentMonthIndex]} {currentYear}</strong>
              <button 
                type='button' 
                onClick={handleNextMonth}
                style={{ border: 'none', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', padding: '0 0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}
              >
                {'>'}
              </button>
            </div>

            <div
              style={{
                marginTop: '1rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '0.6rem',
                textAlign: 'center',
                color: 'var(--muted)',
                fontSize: '0.9rem',
              }}
            >
              {['Pn', 'Wt', 'Sr', 'Cz', 'Pt', 'Sb', 'Nd'].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <CalendarGrid
              calendarRows={calendarRows}
              activeDate={filterByCalendarDay ? activeDate : ''}
              onSelectDate={(day) => {
                if (activeDate === day && filterByCalendarDay) {
                  setFilterByCalendarDay(false)
                } else {
                  setActiveDate(day)
                  setFilterByCalendarDay(true)
                }
                console.log('events:calendar-day', day)
              }}
            />
          </article>

          <article className='page-card' style={{ padding: '1.2rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Najbliższe przypomnienia</h2>

            <div style={{ marginTop: '1rem', display: 'grid', gap: '1rem' }}>
              {initialReminders.map((item) => (
                <ReminderItem
                  key={item.id}
                  {...item}
                  isSelected={selectedReminder === item.id}
                  onClick={() => {
                    setSelectedReminder(item.id)
                  }}
                />
              ))}
            </div>

            {selectedReminder && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid #f2e2d0',
                background: '#fffbf7',
                fontSize: '0.88rem',
                lineHeight: '1.5',
                color: '#6f6559',
                animation: 'fadeIn 0.25s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#db7e45' }}>📝 Szczegóły:</strong>
                  <button 
                    onClick={() => setSelectedReminder('')}
                    style={{ background: 'none', border: 'none', color: '#db7e45', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                  >
                    Zamknij
                  </button>
                </div>
                {selectedReminder === 'r1' && 'Omówienie ostatecznego menu weselnego z managerem cateringu. Ustalenie godzin podawania ciepłych posiłków (17:30, 20:00, 22:30) oraz przekazanie zapotrzebowań dietetycznych (wege/gluten-free).'}
                {selectedReminder === 'r2' && 'Próba smaków wybranych dań weselnych w restauracji partnerskiej. Dobór deserów, ciast oraz degustacja weselnego tortu wegańskiego.'}
                {selectedReminder === 'r3' && 'Ostateczne zatwierdzenie kompozycji kwiatowych z florystką. Wybór koloru obrusów, świeczników oraz dekoracji ścianki Pary Młodej.'}
              </div>
            )}

            <button
              type='button'
              onClick={() => setShowRemindersModal(true)}
              style={{
                marginTop: '1.2rem',
                border: '1px solid #efe1d0',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                textAlign: 'center',
                color: '#db7e45',
                fontWeight: 600,
                background: '#fffdfa',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Zobacz wszystkie
            </button>
          </article>
        </div>
      </div>

      <article
        className='page-card'
        style={{
          padding: '1.2rem',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div
            style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '16px',
              background: '#fff3df',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <EventIcon name='clock' color='#db8f29' size={20} />
          </div>
          <div>
            <strong style={{ display: 'block', fontSize: '1rem' }}>
              Dobrze zaplanowany harmonogram to klucz do udanego wesela!
            </strong>
            <p style={{ margin: '0.35rem 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Zadania dodane tutaj automatycznie synchronizują się z Twoim planerem i budżetem.
            </p>
          </div>
        </div>

        <button
          type='button'
          onClick={handleAddNewEvent}
          style={{
            padding: '0.9rem 1.2rem',
            borderRadius: '14px',
            border: '1px solid #e8b089',
            color: '#db7e45',
            fontWeight: 700,
            background: '#fffdfa',
            cursor: 'pointer',
          }}
        >
          Dodaj nowe zadanie
        </button>
      </article>

      {/* LUXURIOUS ALL REMINDERS MODAL */}
      {showRemindersModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(47, 42, 36, 0.4)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div className="page-card" style={{
            width: '100%',
            maxWidth: '480px',
            background: '#fff',
            padding: '2.5rem',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(47, 42, 36, 0.15)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowRemindersModal(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                color: 'var(--muted)',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>

            <header style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#db7e45', fontWeight: 600 }}>Powiadomienia Weselne</span>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.8rem', margin: '0.25rem 0', fontWeight: 500 }}>
                Wszystkie Przypomnienia
              </h2>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.85rem' }}>Śledź nadchodzące terminy i ważne kamienie milowe.</p>
            </header>

            <div style={{ display: 'grid', gap: '1rem', maxHeight: '320px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {initialReminders.map(item => (
                <div key={item.id} style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid #efe4d7',
                  background: '#fffdfa',
                  display: 'grid',
                  gap: '0.35rem'
                }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                    <strong style={{ fontSize: '0.95rem' }}>{item.title}</strong>
                  </div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>📅 Termin: {item.date} o godzinie {item.time}</span>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#6f6559', lineHeight: '1.4' }}>
                    {item.id === 'r1' && 'Omówienie ostatecznego menu weselnego z managerem cateringu. Ustalenie godzin podawania posiłków.'}
                    {item.id === 'r2' && 'Próba smaków wybranych dań weselnych w restauracji partnerskiej. Dobór deserów i ciast.'}
                    {item.id === 'r3' && 'Ostateczne zatwierdzenie kompozycji kwiatowych z florystką. Wybór dekoracji ścianki Pary Młodej.'}
                  </p>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setShowRemindersModal(false)}
              style={{
                width: '100%',
                marginTop: '1.5rem',
                padding: '0.75rem',
                borderRadius: '10px',
                border: 'none',
                background: '#db7e45',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Zamknij widok
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
