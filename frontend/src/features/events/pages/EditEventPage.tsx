import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getEvent, getEvents, toWedding, updateEvent } from '../../../api/eventApi'
import type { RootState } from '../../../store'
import { setActiveWeddingId, setEvents } from '../../../store/slices/authSlice'

export function EditEventPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { eventId: eventIdParam } = useParams()
  const { token, activeWeddingId } = useSelector((state: RootState) => state.auth)
  const eventId = Number(eventIdParam)
  const isActiveEvent = Number.isInteger(eventId) && activeWeddingId === eventId

  const [formData, setFormData] = useState({
    firstName: '',
    partnerName: '',
    date: '',
    location: '',
    status: '',
  })
  const [isLoading, setIsLoading] = useState(isActiveEvent)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(
    isActiveEvent ? null : 'Nie wskazano aktywnego wydarzenia do edycji.',
  )

  useEffect(() => {
    if (!isActiveEvent) return

    const loadEvent = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const event = await getEvent(eventId, { token: token ?? undefined })
        const [firstName, partnerName = ''] = event.name.split('&', 2).map(part => part.trim())

        setFormData({
          firstName,
          partnerName,
          date: event.eventDate?.split('T')[0] ?? '',
          location: event.location ?? '',
          status: event.status,
        })
      } catch {
        setError('Nie udało się pobrać szczegółów wydarzenia.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadEvent()
  }, [eventId, isActiveEvent, token])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData(previous => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!isActiveEvent) {
      setError('Brak aktywnego wydarzenia do zapisania.')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      await updateEvent(eventId, {
        name: `${formData.firstName.trim()} & ${formData.partnerName.trim()}`,
        eventDate: `${formData.date}T00:00:00`,
        location: formData.location,
        status: formData.status,
      }, { token: token ?? undefined })

      const events = await getEvents({ token: token ?? undefined })
      dispatch(setEvents(events.map(toWedding)))
      dispatch(setActiveWeddingId(eventId))
      navigate('/?eventUpdated=1')
    } catch {
      setError('Nie udało się zapisać zmian wydarzenia. Spróbuj ponownie.')
    } finally {
      setIsSaving(false)
    }
  }

  const displayedError = isActiveEvent ? error : 'Nie wskazano aktywnego wydarzenia do edycji.'

  if (isLoading) {
    return (
      <section className='page-card' style={{ maxWidth: '680px', margin: '3rem auto', padding: '2rem', textAlign: 'center' }}>
        <h1 className='page-title'>Ładowanie wydarzenia...</h1>
        <p className='page-subtitle'>Pobieramy aktualne szczegóły z backendu.</p>
      </section>
    )
  }

  return (
    <section style={{ maxWidth: '680px', margin: '2rem auto', display: 'grid', gap: '1.5rem' }}>
      <header style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--primary)', fontWeight: 600 }}>
          Aktywne wydarzenie
        </span>
        <h1 className='page-title' style={{ fontFamily: 'Georgia, serif', fontSize: '2.3rem', fontWeight: 500 }}>
          Edytuj szczegóły wesela
        </h1>
        <p className='page-subtitle'>Zmień imiona, datę lub miejsce wydarzenia.</p>
      </header>

      <form onSubmit={handleSubmit} className='page-card' style={{ padding: '2.5rem', display: 'grid', gap: '1.4rem' }}>
        {displayedError && <p style={errorStyle}>{displayedError}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label style={labelStyle}>
            Twoje imię
            <input name='firstName' value={formData.firstName} onChange={handleChange} required style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Imię Partnera/Partnerki
            <input name='partnerName' value={formData.partnerName} onChange={handleChange} required style={inputStyle} />
          </label>
        </div>
        <label style={labelStyle}>
          Data ślubu
          <input type='date' name='date' value={formData.date} onChange={handleChange} required style={inputStyle} />
        </label>
        <label style={labelStyle}>
          Miejsce / Sala Weselna (opcjonalnie)
          <input name='location' value={formData.location} onChange={handleChange} style={inputStyle} />
        </label>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <Link to='/' style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', border: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 600 }}>
            Anuluj
          </Link>
          <button type='submit' disabled={isSaving || !isActiveEvent} style={{
            padding: '0.75rem 1.8rem',
            borderRadius: '10px',
            border: 'none',
            background: 'var(--primary)',
            color: '#fff',
            fontWeight: 700,
            cursor: isSaving ? 'wait' : 'pointer',
            opacity: isSaving || !isActiveEvent ? 0.7 : 1,
          }}>
            {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </button>
        </div>
      </form>
    </section>
  )
}

const labelStyle = {
  display: 'grid',
  gap: '0.5rem',
  fontSize: '0.85rem',
  fontWeight: 600,
} satisfies React.CSSProperties

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '10px',
  border: '1px solid var(--border)',
  fontSize: '0.95rem',
} satisfies React.CSSProperties

const errorStyle = {
  margin: 0,
  padding: '0.8rem 1rem',
  borderRadius: '10px',
  background: '#fff0f0',
  color: '#a33',
} satisfies React.CSSProperties
