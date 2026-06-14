import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { findPublicRsvp, getPublicRsvp, updatePublicRsvp, type PublicRsvpResponse, type RsvpStatus } from '../../../api/rsvpApi'

const statusLabels: Record<string, string> = {
  PENDING: 'Oczekuje',
  CONFIRMED: 'Potwierdzony',
  DECLINED: 'Odmówiony',
  REJECTED: 'Odmówiony',
}

export function GuestRsvpPage() {
  const { eventCode, guestCode } = useParams()
  const navigate = useNavigate()
  const [invitation, setInvitation] = useState<PublicRsvpResponse | null>(null)
  const [loading, setLoading] = useState(Boolean(eventCode && guestCode))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [searchForm, setSearchForm] = useState({ eventCode: '', firstName: '', lastName: '' })
  const [allergies, setAllergies] = useState('')
  const [declineReason, setDeclineReason] = useState('')
  const [declining, setDeclining] = useState(false)

  useEffect(() => {
    if (!eventCode || !guestCode) return

    getPublicRsvp(eventCode, guestCode)
      .then(found => {
        setInvitation(found)
        setAllergies(found.allergies ?? '')
        setDeclineReason(found.declineReason ?? '')
      })
      .catch(() => setError('Zaproszenie nie istnieje lub link jest nieprawidłowy.'))
      .finally(() => setLoading(false))
  }, [eventCode, guestCode])

  const findInvitation = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const found = await findPublicRsvp(searchForm)
      setInvitation(found)
      setAllergies(found.allergies ?? '')
      setDeclineReason(found.declineReason ?? '')
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : ''
      setError(message.includes('409')
        ? 'Znaleziono więcej niż jednego gościa o tych danych. Skontaktuj się z parą młodą.'
        : message.includes('404')
          ? 'Nie znaleziono zaproszenia. Sprawdź kod, imię i nazwisko.'
          : 'Nie udało się sprawdzić zaproszenia. Spróbuj ponownie.')
    } finally {
      setLoading(false)
    }
  }

  const saveStatus = async (status: RsvpStatus) => {
    const selectedEventCode = invitation?.eventCode ?? eventCode
    const selectedGuestCode = invitation?.guestCode ?? guestCode
    if (!selectedEventCode || !selectedGuestCode) return
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      setInvitation(await updatePublicRsvp(selectedEventCode, selectedGuestCode, {
        rsvpStatus: status,
        allergies: allergies.trim(),
        declineReason: status === 'DECLINED' ? declineReason.trim() : null,
      }))
      setMessage(status === 'CONFIRMED'
        ? 'Dziękujemy. Twoja obecność została potwierdzona. Za chwilę nastąpi przekierowanie.'
        : 'Dziękujemy. Twoja odpowiedź została zapisana. Za chwilę nastąpi przekierowanie.')
      window.setTimeout(() => navigate('/'), 1500)
    } catch {
      setError('Nie udało się zapisać odpowiedzi. Spróbuj ponownie.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #faf7f2 0%, #efe7dc 100%)', display: 'grid', placeItems: 'center', padding: '2rem 1rem' }}>
      <section style={{ width: 'min(560px, 100%)', background: '#fff', borderRadius: '24px', border: '1px solid #e2d7c7', boxShadow: '0 12px 40px rgba(47, 42, 36, 0.08)', padding: '3rem 2rem', textAlign: 'center', display: 'grid', gap: '1.5rem' }}>
        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#b85a1f', fontWeight: 600 }}>
          Potwierdzenie obecności
        </span>

        {loading && <p>Ładowanie zaproszenia...</p>}

        {!loading && !invitation && !eventCode && !guestCode && (
          <form onSubmit={findInvitation} style={{ display: 'grid', gap: '1rem', textAlign: 'left' }}>
            <label style={{ display: 'grid', gap: '0.35rem' }}>
              <span>Kod zaproszenia</span>
              <input required value={searchForm.eventCode} onChange={event => setSearchForm(current => ({ ...current, eventCode: event.target.value }))} style={{ padding: '0.8rem', borderRadius: '10px', border: '1px solid #d8cfc2' }} />
            </label>
            <label style={{ display: 'grid', gap: '0.35rem' }}>
              <span>Imię</span>
              <input required value={searchForm.firstName} onChange={event => setSearchForm(current => ({ ...current, firstName: event.target.value }))} style={{ padding: '0.8rem', borderRadius: '10px', border: '1px solid #d8cfc2' }} />
            </label>
            <label style={{ display: 'grid', gap: '0.35rem' }}>
              <span>Nazwisko</span>
              <input required value={searchForm.lastName} onChange={event => setSearchForm(current => ({ ...current, lastName: event.target.value }))} style={{ padding: '0.8rem', borderRadius: '10px', border: '1px solid #d8cfc2' }} />
            </label>
            {error && <p style={{ color: '#c53030', fontWeight: 600, textAlign: 'center' }}>{error}</p>}
            <button type='submit' style={{ padding: '1rem', borderRadius: '12px', border: 'none', background: '#b85a1f', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
              Znajdź zaproszenie
            </button>
          </form>
        )}

        {!loading && !invitation && eventCode && guestCode && (
          <>
            <p style={{ color: '#c53030', fontWeight: 600 }}>{error ?? 'Zaproszenie nie istnieje lub link jest nieprawidłowy.'}</p>
            <Link to='/' style={{ color: '#6b6257', textDecoration: 'underline' }}>Wróć do strony głównej</Link>
          </>
        )}

        {!loading && invitation && (
          <>
            <header>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2.2rem', margin: '0 0 0.6rem', fontWeight: 400 }}>{invitation.eventName}</h1>
              <p style={{ color: '#6b6257', margin: 0 }}>
                {new Date(invitation.eventDate).toLocaleDateString('pl-PL')}
                {invitation.eventLocation ? `, ${invitation.eventLocation}` : ''}
              </p>
            </header>

            <div style={{ background: '#faf8f4', padding: '1.25rem', borderRadius: '14px', border: '1px solid #efe8dc' }}>
              <strong style={{ display: 'block', fontSize: '1.25rem' }}>Zaproszenie dla: {invitation.guestName}</strong>
              <span style={{ display: 'block', color: '#6b6257', marginTop: '0.25rem' }}>Wesele: {invitation.eventName}</span>
              <span style={{ color: '#6b6257' }}>Aktualny status: {statusLabels[invitation.rsvpStatus] ?? 'Oczekuje'}</span>
            </div>

            <label style={{ display: 'grid', gap: '0.4rem', textAlign: 'left' }}>
              <span style={{ fontWeight: 600 }}>Alergie lub uwagi żywieniowe</span>
              <textarea
                value={allergies}
                onChange={event => setAllergies(event.target.value)}
                placeholder='np. orzechy, gluten, dieta wegetariańska'
                style={{ padding: '0.8rem', borderRadius: '10px', border: '1px solid #d8cfc2', resize: 'vertical' }}
              />
            </label>

            {declining && (
              <label style={{ display: 'grid', gap: '0.4rem', textAlign: 'left' }}>
                <span style={{ fontWeight: 600 }}>Powód odmowy, opcjonalnie</span>
                <textarea
                  value={declineReason}
                  onChange={event => setDeclineReason(event.target.value)}
                  placeholder='Możesz krótko napisać, dlaczego nie możesz przyjść.'
                  style={{ padding: '0.8rem', borderRadius: '10px', border: '1px solid #d8cfc2', resize: 'vertical' }}
                />
              </label>
            )}

            {message && <p style={{ color: '#35684f', fontWeight: 600 }}>{message}</p>}
            {error && <p style={{ color: '#c53030', fontWeight: 600 }}>{error}</p>}

            <div style={{ display: 'grid', gap: '0.9rem' }}>
              <button type='button' disabled={saving} onClick={() => void saveStatus('CONFIRMED')} style={{ padding: '1rem', borderRadius: '12px', border: 'none', background: '#35684f', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                Potwierdzam obecność
              </button>
              <button type='button' disabled={saving} onClick={() => declining ? void saveStatus('DECLINED') : setDeclining(true)} style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #d8cfc2', background: '#fff', color: '#8c5a12', fontWeight: 700, cursor: 'pointer' }}>
                {declining ? 'Zapisz odmowę' : 'Nie mogę przyjść'}
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  )
}
