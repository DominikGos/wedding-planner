import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  createGuest as createGuestRequest,
  deleteGuest as deleteGuestRequest,
  getGuests,
  updateGuest as updateGuestRequest,
  type GuestRequest,
  type GuestResponse,
} from '../../../api/guestApi'
import type { RootState } from '../../../store'
import { addGuest, deleteGuest, setGuests, updateGuest } from '../../../store/slices/guestsSlice'

import { GuestRow } from '../components/GuestRow'
import { SummaryCard } from '../components/SummaryCard'
import { ToolbarButton } from '../components/ToolbarButton'
import type { Guest, GuestStatus } from '../data/guestsMock'

const statusOptions: GuestStatus[] = ['Potwierdzony', 'Oczekuje', 'Odrzucony']

function toUiStatus(status: string | null | undefined): GuestStatus {
  const normalized = (status ?? '').toUpperCase()

  if (['CONFIRMED', 'ACCEPTED', 'YES', 'POTWIERDZONY'].includes(normalized)) return 'Potwierdzony'
  if (['REJECTED', 'DECLINED', 'NO', 'ODRZUCONY'].includes(normalized)) return 'Odrzucony'
  return 'Oczekuje'
}

function toApiStatus(status: GuestStatus) {
  if (status === 'Potwierdzony') return 'CONFIRMED'
  if (status === 'Odrzucony') return 'DECLINED'
  return 'PENDING'
}

function getGuestName(response: GuestResponse) {
  return [response.firstName, response.lastName].filter(Boolean).join(' ').trim() || 'Gość bez nazwy'
}

function toGuest(response: GuestResponse): Guest {
  return {
    id: String(response.id),
    name: getGuestName(response),
    email: response.email ?? '',
    status: toUiStatus(response.rsvpStatus),
    table: response.tableName || '—',
    allergy: response.allergies || '—',
    declineReason: response.declineReason ?? '',
    guestCode: response.guestCode,
  }
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const firstName = parts.shift() ?? ''

  return {
    firstName,
    lastName: parts.join(' '),
  }
}

function toGuestRequest(form: {
  name: string
  email: string
  status: GuestStatus
  table: string
  allergy: string
  declineReason: string
}): GuestRequest {
  const { firstName, lastName } = splitName(form.name)

  return {
    firstName,
    lastName,
    email: form.email.trim(),
    rsvpStatus: toApiStatus(form.status),
    tableName: form.table.trim(),
    allergies: form.allergy.trim(),
    declineReason: form.status === 'Odrzucony' ? form.declineReason.trim() : '',
  }
}

export function GuestsPage() {
  const dispatch = useDispatch()
  const listState = useSelector((state: RootState) => state.guests.items)
  const { activeWeddingId, token } = useSelector((state: RootState) => state.auth)
  const activeWedding = useSelector((state: RootState) => state.auth.weddings.find(wedding => wedding.id === state.auth.activeWeddingId))

  const [formState, setFormState] = useState({
    search: '',
    status: 'Wszystkie',
  })
  const [showModal, setShowModal] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [loading, setLoading] = useState(Boolean(activeWeddingId && token))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guestsNotification, setGuestsNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const [guestForm, setGuestForm] = useState({
    name: '',
    email: '',
    status: 'Oczekuje' as GuestStatus,
    table: '',
    allergy: '',
    declineReason: '',
  })

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setGuestsNotification({ text, type })
    setTimeout(() => {
      setGuestsNotification(null)
    }, 4500)
  }

  const loadGuests = useCallback(async () => {
    if (!activeWeddingId || !token) return

    setLoading(true)
    setError(null)
    try {
      const guests = await getGuests(activeWeddingId, { token })
      const mappedGuests = guests.map(toGuest)
      dispatch(setGuests(mappedGuests))
    } catch {
      setError('Nie udało się pobrać gości z backendu.')
      dispatch(setGuests([]))
    } finally {
      setLoading(false)
    }
  }, [activeWeddingId, dispatch, token])

  useEffect(() => {
    if (!activeWeddingId || !token) {
      dispatch(setGuests([]))
      return
    }

    queueMicrotask(() => void loadGuests())
  }, [activeWeddingId, dispatch, loadGuests, token])

  const filteredGuests = useMemo(() => {
    const phrase = formState.search.trim().toLowerCase()

    return listState.filter((guest) => {
      const matchesSearch = !phrase
        || guest.name.toLowerCase().includes(phrase)
        || guest.email.toLowerCase().includes(phrase)
      const matchesStatus = formState.status === 'Wszystkie' || guest.status === formState.status
      return matchesSearch && matchesStatus
    })
  }, [formState.search, formState.status, listState])

  const summaryCards = useMemo(() => {
    const confirmed = listState.filter((guest) => guest.status === 'Potwierdzony').length
    const waiting = listState.filter((guest) => guest.status === 'Oczekuje').length
    const rejected = listState.filter((guest) => guest.status === 'Odrzucony').length

    return [
      { id: 'all', title: 'Wszyscy Goście', value: String(listState.length), color: 'var(--text)', border: 'var(--border)' },
      { id: 'Potwierdzony', title: 'Potwierdzeni', value: String(confirmed), color: '#0ea44b', border: '#bfeecf' },
      { id: 'Oczekuje', title: 'Oczekujący', value: String(waiting), color: '#ef8a00', border: '#f4da8b' },
      { id: 'Odrzucony', title: 'Odrzuceni', value: String(rejected), color: '#eb1d1d', border: '#f4c1c1' },
    ]
  }, [listState])

  const handleOpenAdd = () => {
    setEditingGuest(null)
    setGuestForm({
      name: '',
      email: '',
      status: 'Oczekuje',
      table: '',
      allergy: '',
      declineReason: '',
    })
    setShowModal(true)
  }

  const handleOpenEdit = (guest: Guest) => {
    setEditingGuest(guest)
    setGuestForm({
      name: guest.name,
      email: guest.email || '',
      status: guest.status,
      table: guest.table === '—' ? '' : guest.table,
      allergy: guest.allergy === '—' ? '' : guest.allergy,
      declineReason: guest.declineReason ?? '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeWeddingId || !token) return
    if (!guestForm.name.trim()) {
      showNotification('Proszę podać imię i nazwisko gościa.', 'error')
      return
    }

    setSaving(true)
    try {
      if (editingGuest) {
        const guestId = Number(editingGuest.id)
        if (!Number.isFinite(guestId)) {
          showNotification('Ten gość nie ma poprawnego identyfikatora z backendu.', 'error')
          return
        }

        const updated = toGuest(await updateGuestRequest(activeWeddingId, guestId, toGuestRequest(guestForm), { token }))
        dispatch(updateGuest(updated))
        showNotification(`Zaktualizowano dane gościa "${updated.name}".`, 'success')
      } else {
        const created = toGuest(await createGuestRequest(activeWeddingId, toGuestRequest(guestForm), { token }))
        dispatch(addGuest(created))
        showNotification(`Dodano gościa "${created.name}".`, 'success')
      }

      setShowModal(false)
      setEditingGuest(null)
    } catch {
      showNotification('Nie udało się zapisać gościa w backendzie.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteGuest = async () => {
    if (!activeWeddingId || !token || !editingGuest) return

    const guestId = Number(editingGuest.id)
    if (!Number.isFinite(guestId)) {
      showNotification('Ten gość nie ma poprawnego identyfikatora z backendu.', 'error')
      return
    }
    if (!window.confirm(`Czy na pewno usunąć gościa "${editingGuest.name}"?`)) return

    setSaving(true)
    try {
      await deleteGuestRequest(activeWeddingId, guestId, { token })
      dispatch(deleteGuest(editingGuest.id))
      showNotification(`Usunięto gościa "${editingGuest.name}" z listy.`, 'success')
      setShowModal(false)
      setEditingGuest(null)
    } catch {
      showNotification('Nie udało się usunąć gościa w backendzie.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCopyEventCode = async () => {
    if (!activeWedding?.eventCode) {
      showNotification('Kod zaproszenia nie jest jeszcze dostępny.', 'error')
      return
    }
    try {
      await navigator.clipboard.writeText(activeWedding.eventCode)
      showNotification('Skopiowano kod zaproszenia.', 'success')
    } catch {
      showNotification('Nie udało się skopiować kodu zaproszenia.', 'error')
    }
  }

  if (!activeWeddingId) {
    return <section className='page-card' style={{ padding: '2rem', textAlign: 'center' }}>Wybierz aktywne wydarzenie, aby zobaczyć gości.</section>
  }

  if (!token) {
    return <section className='page-card' style={{ padding: '2rem', textAlign: 'center' }}>Lista gości z backendu jest dostępna po zalogowaniu przez Google.</section>
  }

  return (
    <section style={{ display: 'grid', gap: '1rem' }}>
      {guestsNotification && (
        <div style={{
          padding: '1rem',
          borderRadius: '12px',
          background: guestsNotification.type === 'success' ? 'color-mix(in srgb, var(--ok) 14%, var(--surface))' : 'var(--danger-soft)',
          color: guestsNotification.type === 'success' ? 'var(--ok)' : 'var(--danger)',
          border: `1px solid ${guestsNotification.type === 'success' ? 'var(--ok)' : 'var(--danger)'}`,
          fontWeight: 600,
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease',
        }}>
          {guestsNotification.text}
        </div>
      )}

      {loading && (
        <div className='app-alert app-alert-info' style={{ textAlign: 'center' }}>
          Pobieramy gości z backendu...
        </div>
      )}

      {error && (
        <div className='app-alert app-alert-danger' style={{ textAlign: 'center' }}>
          {error}
        </div>
      )}

      <article
        className='page-card'
        style={{
          padding: '1.6rem',
          background: 'linear-gradient(180deg, var(--surface) 0%, var(--surface-soft) 100%)',
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
              Lista Gości
            </h1>
            <p className='page-subtitle' style={{ fontSize: '1.05rem' }}>
              Zarządzaj listą gości aktywnego wydarzenia z bazy danych.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type='button' onClick={() => void handleCopyEventCode()} className='button-secondary'>
              Kopiuj kod zaproszenia
            </button>
            <button
              className='button-primary'
              type='button'
              onClick={handleOpenAdd}
              style={{
                padding: '0.85rem 1.25rem',
                borderRadius: '14px',
                background: 'var(--primary)',
                color: 'var(--on-primary)',
                fontWeight: 700,
                boxShadow: '0 10px 24px rgba(214, 160, 97, 0.24)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Dodaj gościa
            </button>
          </div>
        </div>

        <div
          className='guest-summary-grid'
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
              }}
            />
          ))}
        </div>
      </article>

      <article className='page-card data-table-card'>
        <div
          style={{
            padding: '1.35rem 1.2rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Goście ({filteredGuests.length})</h2>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <ToolbarButton label='Odśwież' onClick={() => void loadGuests()} />
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
          <div className='filter-toolbar' style={{ marginBottom: '1rem' }}>
            <input
              value={formState.search}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  search: event.target.value,
                }))
              }
              placeholder='Szukaj po imieniu, nazwisku lub e-mailu...'
              className='filter-control'
            />

            <select
              value={formState.status}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
              className='filter-control'
            >
              <option value='Wszystkie'>Wszystkie statusy</option>
              {statusOptions.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>

          <div
            className='guest-table-wrapper data-table-wrapper'
            style={{
              border: '1px solid var(--border)',
              borderRadius: '18px',
              background: 'var(--surface)',
            }}
          >
            <div
              className='data-table-header'
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1.5fr 0.8fr 1fr 1.2fr 1fr 0.6fr',
                gap: '1rem',
                minWidth: '1120px',
                padding: '1rem 0.9rem',
              }}
            >
              <span>Imię i nazwisko</span>
              <span>Email</span>
              <span style={{ textAlign: 'center' }}>Stół</span>
              <span>Alergie</span>
              <span>Powód odmowy</span>
              <span>Status RSVP</span>
              <span style={{ textAlign: 'right' }}>Akcje</span>
            </div>

            {!loading && filteredGuests.map((guest) => (
              <GuestRow
                key={guest.id}
                guest={guest}
                onEdit={() => handleOpenEdit(guest)}
              />
            ))}

            {!loading && filteredGuests.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
                Brak gości spełniających kryteria wyszukiwania.
              </div>
            )}
          </div>

        </div>
      </article>

      {showModal && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(47, 42, 36, 0.4)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease',
        }}>
          <form
            onSubmit={handleSubmit}
            className='page-card modal-card'
            style={{
              width: '100%',
              maxWidth: '460px',
              background: 'var(--surface)',
              padding: '2.5rem',
              borderRadius: '20px',
              boxShadow: '0 20px 50px rgba(47, 42, 36, 0.15)',
              display: 'grid',
              gap: '1.2rem',
              position: 'relative',
            }}
          >
            <button
              type='button'
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
                fontWeight: 'bold',
              }}
            >
              x
            </button>

            <header style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--primary)', fontWeight: 600 }}>Karta gościa</span>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.8rem', margin: '0.25rem 0', fontWeight: 500 }}>
                {editingGuest ? 'Edytuj gościa' : 'Nowy gość'}
              </h2>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.85rem' }}>Dane są zapisywane w bazie aktywnego wydarzenia.</p>
            </header>

            <label style={{ display: 'grid', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Imię i nazwisko</span>
              <input
                type='text'
                placeholder='np. Anna Nowak'
                value={guestForm.name}
                onChange={(e) => setGuestForm(prev => ({ ...prev, name: e.target.value }))}
                required
                style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
              />
            </label>

            <label style={{ display: 'grid', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Adres E-mail</span>
              <input
                type='email'
                placeholder='np. anna.nowak@gmail.com'
                value={guestForm.email}
                onChange={(e) => setGuestForm(prev => ({ ...prev, email: e.target.value }))}
                required
                style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
              />
            </label>

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
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontWeight: 600,
                }}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>

            <label style={{ display: 'grid', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Stół</span>
              <input
                type='text'
                placeholder='Opcjonalnie, np. Stół 5'
                value={guestForm.table}
                onChange={(e) => setGuestForm(prev => ({ ...prev, table: e.target.value }))}
                style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
              />
            </label>

            <label style={{ display: 'grid', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Alergie / Wymagania Dietetyczne</span>
              <input
                type='text'
                placeholder='Opcjonalnie'
                value={guestForm.allergy}
                onChange={(e) => setGuestForm(prev => ({ ...prev, allergy: e.target.value }))}
                style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
              />
            </label>

            <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              {editingGuest ? (
                <button
                  type='button'
                  onClick={() => void handleDeleteGuest()}
                  disabled={saving}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid var(--danger)',
                    background: 'var(--danger-soft)',
                    color: 'var(--danger)',
                    fontWeight: 600,
                    cursor: saving ? 'wait' : 'pointer',
                    opacity: saving ? 0.65 : 1,
                  }}
                >
                  Usuń
                </button>
              ) : null}

              <button
                type='button'
                onClick={() => setShowModal(false)}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--muted)',
                  fontWeight: 600,
                  cursor: saving ? 'wait' : 'pointer',
                }}
              >
                Anuluj
              </button>
              <button
                type='submit'
                disabled={saving}
                style={{
                  flex: 2,
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'var(--primary)',
                  color: 'var(--on-primary)',
                  fontWeight: 700,
                  cursor: saving ? 'wait' : 'pointer',
                  opacity: saving ? 0.65 : 1,
                  boxShadow: '0 4px 12px rgba(214, 160, 97, 0.2)',
                }}
              >
                {saving ? 'Zapisywanie...' : editingGuest ? 'Zapisz zmiany' : 'Dodaj'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}
