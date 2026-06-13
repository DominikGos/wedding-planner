import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { createEvent, getEvents, toWedding } from '../../../api/eventApi'
import { setActiveWeddingId, setEvents, setEventsError, setEventsLoading } from '../../../store/slices/authSlice'
import type { RootState } from '../../../store'

export function CreateEventPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, token } = useSelector((state: RootState) => state.auth)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const userNameForWedding = user?.name && user.name !== 'Użytkownik' ? user.name.split('&')[0].trim() : ''
  
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    partnerA: userNameForWedding,
    partnerB: '',
    date: user?.weddingDate || '',
    venue: '',
    budget: 50000,
    guestsCount: 100,
    style: 'Glamour'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' || name === 'guestsCount' ? Number(value) : value
    }))
  }

  const selectStyle = (style: string) => {
    setFormData(prev => ({ ...prev, style }))
  }

  const handleNext = () => {
    if (step < 4) setStep(prev => prev + 1)
  }

  const handlePrev = () => {
    if (step > 1) setStep(prev => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveError(null)

    const weddingName = `${formData.partnerA} & ${formData.partnerB || 'Partner'}`

    try {
      const createdEvent = await createEvent({
        name: weddingName,
        eventDate: `${formData.date}T00:00:00`,
        location: formData.venue || 'Nie określono',
        status: 'PLANNED',
      }, { token: token ?? undefined })

      dispatch(setEventsLoading())
      const events = await getEvents({ token: token ?? undefined })
      dispatch(setEvents(events.map(toWedding)))
      dispatch(setActiveWeddingId(createdEvent.id))
      navigate('/')
    } catch {
      const message = 'Nie udało się utworzyć wydarzenia. Sprawdź połączenie z backendem i spróbuj ponownie.'
      setSaveError(message)
      dispatch(setEventsError(message))
    } finally {
      setIsSaving(false)
    }
  }

  const stylesList = [
    { name: 'Glamour', desc: 'Błysk, kryształy, eleganckie złoto i klasa.', icon: '✨' },
    { name: 'Boho', desc: 'Luz, naturalność, pióra, trawy pampasowe.', icon: '🌾' },
    { name: 'Rustykalny', desc: 'Drewno, juta, ciepłe światło i leśny klimat.', icon: '🪵' },
    { name: 'Klasyczny', desc: 'Tradycyjna elegancja, biel i czerwień.', icon: '🌹' }
  ]

  return (
    <div style={{ maxWidth: '650px', margin: '2rem auto', padding: '1rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--primary)', fontWeight: 600 }}>Kreator Wesela</span>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2.4rem', margin: '0.5rem 0', fontWeight: 500 }}>Zaprojektuj Swój Ślub</h1>
        <p style={{ color: 'var(--muted)', margin: 0 }}>Przeprowadzimy Cię przez kilka prostych kroków, aby zainicjować Twój harmonogram.</p>
      </header>

      {/* Stepper progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '2px', background: 'var(--border)', zIndex: 1 }} />
        <div style={{ position: 'absolute', top: '15px', left: '0', width: `${((step - 1) / 3) * 100}%`, height: '2px', background: 'var(--primary)', zIndex: 2, transition: 'width 0.4s ease' }} />
        
        {[1, 2, 3, 4].map((s) => (
          <div key={s} style={{ zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: step >= s ? 'var(--primary)' : '#fff',
              border: `2px solid ${step >= s ? 'var(--primary)' : 'var(--border)'}`,
              color: step >= s ? '#fff' : 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.3s ease',
              boxShadow: step === s ? '0 0 0 4px var(--primary-soft)' : 'none'
            }}>
              {s}
            </div>
            <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: step === s ? 600 : 500, color: step >= s ? 'var(--text)' : 'var(--muted)' }}>
              {s === 1 ? 'Podstawowe' : s === 2 ? 'Budżet' : s === 3 ? 'Styl' : 'Podsumowanie'}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="page-card" style={{ background: '#fff', padding: '2.5rem', borderRadius: '20px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
        {saveError && (
          <p style={{ margin: '0 0 1.5rem', padding: '0.8rem 1rem', borderRadius: '10px', background: '#fff0f0', color: '#a33' }}>
            {saveError}
          </p>
        )}
        
        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', margin: '0 0 0.5rem 0', fontFamily: 'Georgia, serif', fontWeight: 500 }}>Krok 1: Imiona i Miejsce</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--muted)' }}>Twoje Imię</label>
                <input 
                  type="text" 
                  name="partnerA" 
                  value={formData.partnerA} 
                  onChange={handleChange} 
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--muted)' }}>Imię Partnera/Partnerki</label>
                <input 
                  type="text" 
                  name="partnerB" 
                  value={formData.partnerB} 
                  onChange={handleChange} 
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--muted)' }}>Data Ślubu</label>
              <input 
                type="date" 
                name="date" 
                value={formData.date} 
                onChange={handleChange} 
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--muted)' }}>Miejsce / Sala Weselna (opcjonalnie)</label>
              <input 
                type="text" 
                name="venue" 
                placeholder="np. Złoty Dwór, Warszawa"
                value={formData.venue} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
              />
            </div>
          </div>
        )}

        {/* STEP 2: Budget & Guests */}
        {step === 2 && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', margin: '0 0 0.5rem 0', fontFamily: 'Georgia, serif', fontWeight: 500 }}>Krok 2: Szacowany Budżet i Goście</h2>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.85rem' }}>
              Te informacje mają obecnie charakter pomocniczy i nie są jeszcze zapisywane w backendzie.
            </p>
            
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--muted)' }}>
                <span>Budżet Całkowity</span>
                <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{formData.budget.toLocaleString()} PLN</strong>
              </label>
              <input 
                type="range" 
                name="budget" 
                min="10000" 
                max="250000" 
                step="5000"
                value={formData.budget} 
                onChange={handleChange} 
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                <span>10k PLN</span>
                <span>120k PLN</span>
                <span>250k PLN</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--muted)' }}>
                <span>Szacowana Liczba Gości</span>
                <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{formData.guestsCount} osób</strong>
              </label>
              <input 
                type="range" 
                name="guestsCount" 
                min="10" 
                max="350" 
                step="5"
                value={formData.guestsCount} 
                onChange={handleChange} 
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                <span>10 osób</span>
                <span>180 osób</span>
                <span>350 osób</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Style selection */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.3rem', margin: '0 0 1rem 0', fontFamily: 'Georgia, serif', fontWeight: 500 }}>Krok 3: Styl Twojego Ślubu</h2>
            <p style={{ margin: '0 0 1rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
              Wybrany styl nie jest jeszcze zapisywany w backendzie.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {stylesList.map((styleObj) => (
                <div 
                  key={styleObj.name}
                  onClick={() => selectStyle(styleObj.name)}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: `2px solid ${formData.style === styleObj.name ? 'var(--primary)' : 'var(--border)'}`,
                    background: formData.style === styleObj.name ? 'var(--primary-soft)' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    transform: formData.style === styleObj.name ? 'scale(1.02)' : 'none',
                    boxShadow: formData.style === styleObj.name ? '0 6px 15px rgba(184, 90, 31, 0.1)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{styleObj.icon}</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text)' }}>{styleObj.name}</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)', lineHeight: '1.4' }}>{styleObj.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Summary */}
        {step === 4 && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', margin: '0 0 0.5rem 0', fontFamily: 'Georgia, serif', fontWeight: 500 }}>Krok 4: Podsumowanie Wesela</h2>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.85rem' }}>
              Backend zapisze nazwę, datę, lokalizację i status PLANNED. Budżet, liczba gości oraz styl nie zostaną jeszcze zapisane.
            </p>
            
            <div style={{ background: 'var(--bg-accent)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '0.75rem' }}>
                <span style={{ color: 'var(--muted)' }}>Narzeczeni</span>
                <strong>{formData.partnerA} &amp; {formData.partnerB}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '0.75rem' }}>
                <span style={{ color: 'var(--muted)' }}>Data Ślubu</span>
                <strong>{formData.date}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '0.75rem' }}>
                <span style={{ color: 'var(--muted)' }}>Lokalizacja</span>
                <strong>{formData.venue || 'Nie określono'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '0.75rem' }}>
                <span style={{ color: 'var(--muted)' }}>Budżet</span>
                <strong style={{ color: 'var(--primary)' }}>{formData.budget.toLocaleString()} PLN</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '0.75rem' }}>
                <span style={{ color: 'var(--muted)' }}>Liczba gości</span>
                <strong>{formData.guestsCount} osób</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.25rem' }}>
                <span style={{ color: 'var(--muted)' }}>Styl przewodzący</span>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', background: 'var(--primary-soft)', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}>
                  {formData.style}
                </span>
              </div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>Klikając stwórz, automatycznie wygenerujemy Twój interaktywny planer weselny!</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          {step > 1 ? (
            <button 
              type="button" 
              onClick={handlePrev}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: '#fff',
                color: 'var(--muted)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Cofnij
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button 
              type="button" 
              onClick={handleNext}
              disabled={step === 1 && (!formData.partnerA || !formData.partnerB || !formData.date)}
              style={{
                padding: '0.75rem 1.8rem',
                borderRadius: '10px',
                border: 'none',
                background: step === 1 && (!formData.partnerA || !formData.partnerB || !formData.date) ? 'var(--border)' : 'var(--primary)',
                color: '#fff',
                fontWeight: 600,
                cursor: step === 1 && (!formData.partnerA || !formData.partnerB || !formData.date) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 10px rgba(184, 90, 31, 0.15)'
              }}
            >
              Dalej
            </button>
          ) : (
            <button 
              type="submit"
              disabled={isSaving}
              style={{
                padding: '0.75rem 2.2rem',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--primary)',
                color: '#fff',
                fontWeight: 700,
                cursor: isSaving ? 'wait' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
                transition: 'all 0.2s ease',
                boxShadow: '0 6px 15px rgba(184, 90, 31, 0.25)'
              }}
            >
              {isSaving ? 'Zapisywanie...' : 'Stwórz Wydarzenie ✨'}
            </button>
          )}
        </div>

      </form>
    </div>
  )
}
