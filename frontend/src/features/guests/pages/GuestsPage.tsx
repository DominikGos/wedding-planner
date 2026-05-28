import { useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../../store'
import { addGuest, updateGuest, deleteGuest } from '../../../store/slices/guestsSlice'

import { GuestRow } from '../components/GuestRow'
import { SummaryCard } from '../components/SummaryCard'
import { ToolbarButton } from '../components/ToolbarButton'
import type { Guest, GuestStatus } from '../data/guestsMock'

export function GuestsPage() {
  const dispatch = useDispatch()
  const listState = useSelector((state: RootState) => state.guests.items)

  const [selectedItem, setSelectedItem] = useState<string | null>(listState[0]?.id || null)
  const [formState, setFormState] = useState({
    search: '',
    status: 'Wszystkie',
  })

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [guestsNotification, setGuestsNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const [guestForm, setGuestForm] = useState({
    name: '',
    email: '',
    status: 'Oczekuje' as GuestStatus,
    table: '1',
    allergy: 'Brak'
  })

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setGuestsNotification({ text, type })
    setTimeout(() => {
      setGuestsNotification(null)
    }, 4500)
  }

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

  const handleOpenAdd = () => {
    setEditingGuest(null)
    setGuestForm({
      name: '',
      email: '',
      status: 'Oczekuje',
      table: '1',
      allergy: 'Brak'
    })
    setShowModal(true)
  }

  const handleOpenEdit = (guest: Guest) => {
    setEditingGuest(guest)
    setGuestForm({
      name: guest.name,
      email: guest.email || '',
      status: guest.status,
      table: guest.table,
      allergy: guest.allergy
    })
    setShowModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!guestForm.name.trim()) {
      showNotification('Proszę podać imię i nazwisko gościa!', 'error')
      return
    }
    if (!guestForm.email.trim()) {
      showNotification('Proszę podać adres e-mail gościa!', 'error')
      return
    }

    if (editingGuest) {
      // Edit mode
      const updated: Guest = {
        id: editingGuest.id,
        name: guestForm.name,
        email: guestForm.email,
        status: guestForm.status,
        table: guestForm.table,
        allergy: guestForm.allergy
      }
      dispatch(updateGuest(updated))
      showNotification(`Zaktualizowano pomyślnie dane gościa "${updated.name}"!`, 'success')
    } else {
      // Add mode
      const created: Guest = {
        id: `guest-${Date.now()}`,
        name: guestForm.name,
        email: guestForm.email,
        status: 'Oczekuje',
        table: guestForm.table,
        allergy: guestForm.allergy
      }
      dispatch(addGuest(created))
      showNotification(`Dodano gościa "${created.name}" i automatycznie wysłano zaproszenie RSVP na adres ${created.email}! ✉️`, 'success')
    }

    setShowModal(false)
  }

  const handleDeleteGuest = () => {
    if (editingGuest) {
      dispatch(deleteGuest(editingGuest.id))
      showNotification(`Usunięto gościa "${editingGuest.name}" z listy!`, 'success')
      setShowModal(false)
    }
  }

  return (
    <section style={{ display: 'grid', gap: '1rem' }}>
      
      {guestsNotification && (
        <div style={{
          padding: '1rem',
          borderRadius: '12px',
          background: guestsNotification.type === 'success' ? '#daf6e5' : '#fff2f2',
          color: guestsNotification.type === 'success' ? '#14834b' : '#c53030',
          border: `1px solid ${guestsNotification.type === 'success' ? '#bfeecf' : '#f4c1c1'}`,
          fontWeight: 600,
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease'
        }}>
          {guestsNotification.text}
        </div>
      )}

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
            onClick={handleOpenAdd}
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
            <ToolbarButton label='Eksportuj' onClick={() => showNotification('Pomyślnie wyeksportowano listę gości do pliku CSV!', 'success')} />
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
                onEdit={() => handleOpenEdit(guest)}
              />
            ))}

            {filteredGuests.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
                Brak gości spełniających kryteria wyszukiwania.
              </div>
            )}
          </div>
        </div>
      </article>

      {/* LUXURIOUS ADD/EDIT GUEST MODAL */}
      {showModal && (
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
          <form 
            onSubmit={handleSubmit}
            className="page-card" 
            style={{
              width: '100%',
              maxWidth: '460px',
              background: '#fff',
              padding: '2.5rem',
              borderRadius: '20px',
              boxShadow: '0 20px 50px rgba(47, 42, 36, 0.15)',
              display: 'grid',
              gap: '1.2rem',
              position: 'relative'
            }}
          >
            <button 
              type="button"
              onClick={() => setShowModal(false)}
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

            <header style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#d6a061', fontWeight: 600 }}>Karta Gościa</span>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.8rem', margin: '0.25rem 0', fontWeight: 500 }}>
                {editingGuest ? 'Edytuj Gościa' : 'Nowy Gość'}
              </h2>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.85rem' }}>Wprowadź dane gościa do weselnego RSVP.</p>
            </header>

            <label style={{ display: 'grid', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Imię i Nazwisko</span>
              <input 
                type="text"
                placeholder="np. Anna Nowak"
                value={guestForm.name}
                onChange={(e) => setGuestForm(prev => ({ ...prev, name: e.target.value }))}
                required
                style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
              />
            </label>

            <label style={{ display: 'grid', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Adres E-mail</span>
              <input 
                type="email"
                placeholder="np. anna.nowak@gmail.com"
                value={guestForm.email}
                onChange={(e) => setGuestForm(prev => ({ ...prev, email: e.target.value }))}
                required
                style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
              />
            </label>

            {editingGuest && (
              <label style={{ display: 'grid', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Status RSVP</span>
                <select 
                  value={guestForm.status}
                  onChange={(e) => setGuestForm(prev => ({ ...prev, status: e.target.value as GuestStatus }))}
                  style={{ 
                    padding: '0.7rem', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border)', 
                    fontSize: '0.95rem', 
                    background: '#fff', 
                    fontWeight: 600,
                    color: guestForm.status === 'Potwierdzony' ? '#0ea44b' : guestForm.status === 'Odrzucony' ? '#eb1d1d' : '#ef8a00'
                  }}
                >
                  <option value="Potwierdzony" style={{ color: '#0ea44b', fontWeight: 600 }}>Potwierdzony</option>
                  <option value="Oczekuje" style={{ color: '#ef8a00', fontWeight: 600 }}>Oczekuje</option>
                  <option value="Odrzucony" style={{ color: '#eb1d1d', fontWeight: 600 }}>Odrzucony</option>
                </select>
              </label>
            )}

            <label style={{ display: 'grid', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Przypisany Stół</span>
              <input 
                type="text"
                placeholder="np. 1 lub '-' dla braku"
                value={guestForm.table}
                onChange={(e) => setGuestForm(prev => ({ ...prev, table: e.target.value }))}
                style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
              />
            </label>

            <label style={{ display: 'grid', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Alergie / Wymagania Dietetyczne</span>
              <input 
                type="text"
                placeholder="np. Brak, Gluten, Laktoza, Orzechy"
                value={guestForm.allergy}
                onChange={(e) => setGuestForm(prev => ({ ...prev, allergy: e.target.value }))}
                style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
              />
            </label>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              {editingGuest ? (
                <button 
                  type="button" 
                  onClick={handleDeleteGuest}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid #eb1d1d',
                    background: '#fff',
                    color: '#eb1d1d',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Usuń
                </button>
              ) : null}
              
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: '#fff',
                  color: 'var(--muted)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Anuluj
              </button>
              <button 
                type="submit"
                style={{
                  flex: 2,
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#d6a061',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(214, 160, 97, 0.2)'
                }}
              >
                {editingGuest ? 'Zapisz zmiany' : 'Dodaj'}
              </button>
            </div>

          </form>
        </div>
      )}

    </section>
  )
}
