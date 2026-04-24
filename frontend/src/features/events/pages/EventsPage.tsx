import { useMemo, useState } from 'react'
import { CalendarGrid } from '../components/CalendarGrid'
import { EventIcon } from '../components/EventIcon'
import { FilterTab } from '../components/FilterTab'
import { ReminderItem } from '../components/ReminderItem'
import { TimelineCard } from '../components/TimelineCard'
import {
  calendarRows,
  filterTabs,
  initialReminders,
  initialTimelineItems,
  tabToSubtitleMap,
} from '../data/eventsMock'

export function EventsPage() {
  const [listState, setListState] = useState(initialTimelineItems)
  const [selectedItem, setSelectedItem] = useState(initialTimelineItems[0].id)
  const [selectedReminder, setSelectedReminder] = useState(initialReminders[0].id)
  const [activeDate, setActiveDate] = useState('25')
  const [showAll, setShowAll] = useState(false)
  const [formState, setFormState] = useState({
    tab: 'Wszystkie',
    category: 'Wszystkie kategorie',
  })

  const visibleEvents = useMemo(() => {
    return listState.filter((item) => {
      const selectedSubtitle = tabToSubtitleMap[formState.tab]
      const matchesTab = selectedSubtitle === null || item.subtitle === selectedSubtitle
      const matchesCategory =
        formState.category === 'Wszystkie kategorie' || item.category === formState.category
      return matchesTab && matchesCategory
    })
  }, [formState.category, formState.tab, listState])

  const displayedEvents = showAll ? visibleEvents : visibleEvents.slice(0, 5)

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
          Harmonogram przygotowan
        </h1>
        <p className='page-subtitle' style={{ fontSize: '1.05rem' }}>
          Zobacz plan przygotowan do slubu i nadchodzace kamienie milowe.
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
            {displayedEvents.map((item) => (
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
              {showAll ? 'Pokaz mniej' : 'Pokaz wiecej'} v
            </button>
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
              <button type='button' onClick={() => console.log('events:prev-month')} style={{ border: 'none', background: 'transparent', color: 'var(--muted)', cursor: 'pointer' }}>
                {'<'}
              </button>
              <strong>Marzec 2026</strong>
              <button type='button' onClick={() => console.log('events:next-month')} style={{ border: 'none', background: 'transparent', color: 'var(--muted)', cursor: 'pointer' }}>
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
              activeDate={activeDate}
              onSelectDate={(day) => {
                setActiveDate(day)
                console.log('events:calendar-day', day)
              }}
            />
          </article>

          <article className='page-card' style={{ padding: '1.2rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Najblizsze przypomnienia</h2>

            <div style={{ marginTop: '1rem', display: 'grid', gap: '1rem' }}>
              {initialReminders.map((item) => (
                <ReminderItem
                  key={item.id}
                  {...item}
                  isSelected={selectedReminder === item.id}
                  onClick={() => {
                    setSelectedReminder(item.id)
                    console.log('events:reminder', item.id)
                  }}
                />
              ))}
            </div>

            <button
              type='button'
              onClick={() => console.log('events:show-all-reminders')}
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
            <p style={{ margin: '0.35rem 0 0', color: 'var(--muted)' }}>
              Regularnie aktualizuj zadania i terminy, aby wszystko przebiegalo zgodnie z planem.
            </p>
          </div>
        </div>

        <button
          type='button'
          onClick={() => {
            setListState((current) => [
              ...current,
              {
                id: `new-${current.length + 1}`,
                month: 'MAJ 2026',
                day: '18',
                weekDay: 'Pon',
                title: 'Nowe zadanie organizacyjne',
                subtitle: 'Zadanie',
                category: 'Catering',
                time: '12:00',
                status: 'Zaplanowane',
                color: '#b57be8',
                icon: 'calendar',
              },
            ])
            console.log('events:add-task')
          }}
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
    </section>
  )
}
