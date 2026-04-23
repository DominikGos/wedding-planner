import { useState } from 'react'
import { BudgetLegendItem } from '../components/BudgetLegendItem'
import { EventCard } from '../components/EventCard'
import { GuestStatCard } from '../components/GuestStatCard'
import { TopStatCard } from '../components/TopStatCard'
import { budgetItems, events, guestStats, topCards } from '../data/dashboardMock'

export function DashboardPage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [hoveredBudgetItem, setHoveredBudgetItem] = useState<string | null>(budgetItems[0].id)
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(events[0].id)
  const [hoveredGuestStat, setHoveredGuestStat] = useState<string | null>(guestStats[0].id)

  return (
    <section style={{ display: 'grid', gap: '1rem' }}>
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
              Pulpit Managera
            </h1>
            <p className='page-subtitle' style={{ fontSize: '1.05rem' }}>
              Witaj, Anna! Oto przeglad Twojego nadchodzacego slubu.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, color: 'var(--muted)' }}>Slub</p>
            <strong style={{ fontSize: '1.8rem', fontFamily: 'Georgia, serif', fontWeight: 500 }}>
              Maria &amp; Jakub
            </strong>
          </div>
        </div>
      </article>

      <div className='stats-grid' style={{ marginTop: 0 }}>
        {topCards.map((card) => (
          <TopStatCard
            key={card.id}
            {...card}
            isHovered={hoveredCard === card.id}
            onHoverStart={() => setHoveredCard(card.id)}
            onHoverEnd={() => setHoveredCard(null)}
          />
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 0.9fr) minmax(320px, 1.7fr)',
          gap: '1rem',
        }}
      >
        <article className='page-card' style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.2rem 1.35rem', borderBottom: '1px solid #f1e8dc' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Podsumowanie Budzetu</h2>
          </div>

          <div style={{ padding: '1.4rem 1.35rem' }}>
            <div
              style={{
                width: '220px',
                height: '220px',
                margin: '0 auto 1.4rem',
                borderRadius: '50%',
                background:
                  'conic-gradient(#d9a15f 0 33%, #dcc2ff 33% 42%, #c9bca5 42% 55%, #f5d9eb 55% 73%, #f39bd0 73% 100%)',
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
              <strong style={{ fontSize: '1rem' }}>Suma calkowita</strong>
              <strong style={{ color: '#d6a061', fontSize: '1.8rem' }}>45 000 PLN</strong>
            </div>
          </div>
        </article>

        <article className='page-card' style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.2rem 1.35rem', borderBottom: '1px solid #f1e8dc' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Najblizsze Wydarzenia</h2>
          </div>

          <div style={{ padding: '1.35rem', display: 'grid', gap: '1rem' }}>
            {events.map((event) => (
              <EventCard
                key={event.id}
                {...event}
                isHovered={hoveredEvent === event.id}
                onHoverStart={() => setHoveredEvent(event.id)}
                onHoverEnd={() => setHoveredEvent(null)}
              />
            ))}
          </div>
        </article>
      </div>

      <article className='page-card' style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.2rem 1.35rem', borderBottom: '1px solid #f1e8dc' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Statystyki Gosci</h2>
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
