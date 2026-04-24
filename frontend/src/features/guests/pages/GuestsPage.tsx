import { useMemo, useState } from 'react'
import { GuestRow } from '../components/GuestRow'
import { SummaryCard } from '../components/SummaryCard'
import { ToolbarButton } from '../components/ToolbarButton'
import { initialGuests } from '../data/guestsMock'

export function GuestsPage() {
  const [listState] = useState(initialGuests)
  const [selectedItem, setSelectedItem] = useState(initialGuests[0].id)
  const [formState, setFormState] = useState({
    search: '',
    status: 'Wszystkie',
  })

  const filteredGuests = useMemo(() => {
    return listState.filter((guest) => {
      const matchesSearch = guest.name.toLowerCase().includes(formState.search.toLowerCase())
      const matchesStatus = formState.status === 'Wszystkie' || guest.status === formState.status
      return matchesSearch && matchesStatus
    })
  }, [formState.search, formState.status, listState])

  const summaryCards = useMemo(() => {
    const confirmed = listState.filter((guest) => guest.status === 'Potwierdzony').length
    const waiting = listState.filter((guest) => guest.status === 'Oczekuje').length
    const rejected = listState.filter((guest) => guest.status === 'Odrzucony').length

    return [
      { id: 'all', title: 'Wszyscy Goscie', value: String(listState.length), color: 'var(--text)', border: 'var(--border)' },
      { id: 'Potwierdzony', title: 'Potwierdzeni', value: String(confirmed), color: '#0ea44b', border: '#bfeecf' },
      { id: 'Oczekuje', title: 'Oczekujacy', value: String(waiting), color: '#ef8a00', border: '#f4da8b' },
      { id: 'Odrzucony', title: 'Odrzuceni', value: String(rejected), color: '#eb1d1d', border: '#f4c1c1' },
    ]
  }, [listState])

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
              Lista Gosci
            </h1>
            <p className='page-subtitle' style={{ fontSize: '1.05rem' }}>
              Zarzadzaj lista gosci i sledz potwierdzenia RSVP
            </p>
          </div>

          <button
            type='button'
            onClick={() => {
              console.log('guests:add')
              setSelectedItem(initialGuests[0].id)
            }}
            style={{
              padding: '0.85rem 1.25rem',
              borderRadius: '14px',
              background: '#d6a061',
              color: '#fff',
              fontWeight: 700,
              boxShadow: '0 10px 24px rgba(214, 160, 97, 0.24)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            + Dodaj Goscia
          </button>
        </div>

        <div
          style={{
            marginTop: '1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '0.9rem',
          }}
        >
          {summaryCards.map((card) => (
            <SummaryCard
              key={card.id}
              title={card.title}
              value={card.value}
              color={card.color}
              border={card.border}
              isSelected={(formState.status === 'Wszystkie' && card.id === 'all') || formState.status === card.id}
              onClick={() => {
                setFormState((current) => ({
                  ...current,
                  status: card.id === 'all' ? 'Wszystkie' : card.id,
                }))
                console.log('guests:summary', card.id)
              }}
            />
          ))}
        </div>
      </article>

      <article className='page-card' style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: '1.35rem 1.2rem',
            borderBottom: '1px solid #f1e8dc',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Goscie ({filteredGuests.length})</h2>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <ToolbarButton label='Eksportuj' onClick={() => console.log('guests:export')} />
            <ToolbarButton
              label='Filtry'
              onClick={() =>
                setFormState((current) => ({
                  ...current,
                  status: current.status === 'Wszystkie' ? 'Potwierdzony' : 'Wszystkie',
                }))
              }
            />
          </div>
        </div>

        <div style={{ padding: '1.1rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(220px, 1fr) 280px',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <input
              value={formState.search}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  search: event.target.value,
                }))
              }
              placeholder='Szukaj po imieniu i nazwisku...'
              style={{
                minHeight: '52px',
                borderRadius: '14px',
                border: '1px solid #efe4d7',
                background: '#fffdfa',
                color: 'var(--text)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 1rem',
                fontSize: '1rem',
              }}
            />

            <select
              value={formState.status}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
              style={{
                minHeight: '52px',
                borderRadius: '14px',
                border: '1px solid #efe4d7',
                background: '#fffdfa',
                padding: '0 1rem',
                fontSize: '1rem',
                color: 'var(--text)',
              }}
            >
              <option value='Wszystkie'>Wszystkie statusy</option>
              <option value='Potwierdzony'>Potwierdzony</option>
              <option value='Oczekuje'>Oczekuje</option>
              <option value='Odrzucony'>Odrzucony</option>
            </select>
          </div>

          <div
            style={{
              border: '1px solid #efe4d7',
              borderRadius: '18px',
              overflow: 'hidden',
              background: '#fffdfa',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2.1fr 1.3fr 0.55fr 1fr 0.7fr',
                gap: '1rem',
                padding: '1rem 0.9rem',
                background: '#fbf8f3',
                fontWeight: 700,
              }}
            >
              <span>Imie i Nazwisko</span>
              <span>Status RSVP</span>
              <span>Stol</span>
              <span>Alergie</span>
              <span style={{ textAlign: 'right' }}>Akcje</span>
            </div>

            {filteredGuests.map((guest) => (
              <GuestRow
                key={guest.id}
                guest={guest}
                isSelected={selectedItem === guest.id}
                onSelect={() => {
                  setSelectedItem(guest.id)
                  console.log('guests:select', guest.id)
                }}
                onEdit={() => {
                  setSelectedItem(guest.id)
                  console.log('guests:edit', guest.id)
                }}
              />
            ))}
          </div>
        </div>
      </article>
    </section>
  )
}
