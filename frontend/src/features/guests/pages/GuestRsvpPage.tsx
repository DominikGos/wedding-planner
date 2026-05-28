import { useState } from 'react'
import { Link } from 'react-router-dom'

export function GuestRsvpPage() {
  const [step, setStep] = useState(1)
  const [searchName, setSearchName] = useState('')
  const [matchedGuest, setMatchedGuest] = useState<string | null>(null)
  
  const [rsvpData, setRsvpData] = useState({
    attending: null as boolean | null,
    hasPlusOne: false,
    plusOneName: '',
    diet: 'Klasyczne',
    allergies: '',
    accommodation: false,
    message: ''
  })

  // Simulated search matching guests
  const mockGuests = [
    'Anna Kowalska',
    'Jan Kowalski',
    'Maria Wiśniewska',
    'Andrzej Nowak',
    'Katarzyna Wójcik',
    'Piotr Kamiński'
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchName.trim()) return

    const found = mockGuests.find(g => 
      g.toLowerCase().includes(searchName.toLowerCase())
    )
    
    if (found) {
      setMatchedGuest(found)
      setStep(2)
    } else {
      // If not found, still let them RSVP with the entered name
      setMatchedGuest(searchName)
      setStep(2)
    }
  }

  const selectAttending = (isAttending: boolean) => {
    setRsvpData(prev => ({ ...prev, attending: isAttending }))
    if (isAttending) {
      setStep(3) // Go to details if attending
    } else {
      setStep(4) // Skip to message if not attending
    }
  }

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(4)
  }

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(5)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top, #faf7f2 0%, #efe7dc 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: "'Playfair Display', Georgia, serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        background: '#fff',
        borderRadius: '24px',
        border: '1px solid #e2d7c7',
        boxShadow: '0 12px 40px rgba(47, 42, 36, 0.08)',
        padding: '3rem 2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative gold-like arches/graphics */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          border: '1px solid #d4af37',
          opacity: 0.15,
          pointerEvents: 'none'
        }} />

        {step < 5 && (
          <header style={{ marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#b85a1f', fontWeight: 600, fontFamily: 'sans-serif' }}>
              Potwierdzenie Obecności
            </span>
            <h1 style={{ fontSize: '2.2rem', margin: '0.5rem 0', fontWeight: 400, color: '#2f2a24' }}>
              Maria &amp; Jakub
            </h1>
            <div style={{ width: '40px', height: '1px', background: '#d4af37', margin: '0.8rem auto' }} />
            <p style={{ fontFamily: 'sans-serif', fontSize: '0.9rem', color: '#6b6257', margin: 0 }}>
              15 Sierpnia 2026, Złoty Dwór
            </p>
          </header>
        )}

        {/* STEP 1: Search Guest */}
        {step === 1 && (
          <form onSubmit={handleSearch} style={{ display: 'grid', gap: '1.5rem' }}>
            <p style={{ fontSize: '1.1rem', color: '#2f2a24', lineHeight: '1.5' }}>
              Witaj! Prosimy o wpisanie swojego imienia i nazwiska, aby odnaleźć zaproszenie.
            </p>
            
            <input 
              type="text" 
              placeholder="Imię i Nazwisko"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid #d8cfc2',
                fontSize: '1.05rem',
                fontFamily: 'sans-serif',
                textAlign: 'center',
                background: '#fffdfa',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
            
            <button 
              type="submit"
              style={{
                padding: '0.9rem',
                borderRadius: '12px',
                border: 'none',
                background: '#b85a1f',
                color: '#fff',
                fontWeight: 600,
                fontSize: '1rem',
                fontFamily: 'sans-serif',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(184, 90, 31, 0.15)'
              }}
            >
              Szukaj Zaproszenia
            </button>
            <div style={{ marginTop: '0.5rem' }}>
              <Link to="/" style={{ fontSize: '0.85rem', color: '#6b6257', textDecoration: 'underline', fontFamily: 'sans-serif' }}>
                Wróć do strony głównej
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: Attending choice */}
        {step === 2 && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 400, color: '#2f2a24', margin: 0 }}>
              Cieszymy się, że jesteś tu, {matchedGuest}!
            </h2>
            <p style={{ fontFamily: 'sans-serif', fontSize: '0.95rem', color: '#6b6257', margin: 0 }}>
              Prosimy o zadeklarowanie swojej obecności na naszym przyjęciu weselnym.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginTop: '1rem' }}>
              <button 
                onClick={() => selectAttending(true)}
                style={{
                  padding: '1.2rem',
                  borderRadius: '14px',
                  border: '1px solid #c8bda9',
                  background: '#fbf9f5',
                  fontSize: '1.15rem',
                  color: '#35684f',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
                }}
              >
                <span>🌹</span> <strong>Potwierdzam przybycie</strong>
              </button>
              
              <button 
                onClick={() => selectAttending(false)}
                style={{
                  padding: '1.2rem',
                  borderRadius: '14px',
                  border: '1px solid #d8cfc2',
                  background: '#fff',
                  fontSize: '1.15rem',
                  color: '#8c5a12',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>✉️</span> <span>Niestety nie będę obecny/obecna</span>
              </button>
            </div>

            <button 
              onClick={() => setStep(1)}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b6257',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontFamily: 'sans-serif',
                fontSize: '0.85rem',
                marginTop: '1rem'
              }}
            >
              Zmień imię i nazwisko
            </button>
          </div>
        )}

        {/* STEP 3: Attending Details */}
        {step === 3 && (
          <form onSubmit={handleDetailsSubmit} style={{ display: 'grid', gap: '1.5rem', textAlign: 'left' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 400, color: '#2f2a24', textAlign: 'center', margin: 0 }}>
              Szczegóły Obecności
            </h2>

            {/* Plus one checkbox */}
            <div style={{ background: '#faf8f4', padding: '1rem', borderRadius: '12px', border: '1px solid #efe8dc' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontFamily: 'sans-serif', fontSize: '0.95rem' }}>
                <input 
                  type="checkbox"
                  checked={rsvpData.hasPlusOne}
                  onChange={(e) => setRsvpData(prev => ({ ...prev, hasPlusOne: e.target.checked }))}
                  style={{ width: '18px', height: '18px', accentColor: '#b85a1f' }}
                />
                <span>Przybywam z osobą towarzyszącą</span>
              </label>

              {rsvpData.hasPlusOne && (
                <div style={{ marginTop: '0.75rem' }}>
                  <input 
                    type="text"
                    placeholder="Imię i nazwisko osoby towarzyszącej"
                    value={rsvpData.plusOneName}
                    onChange={(e) => setRsvpData(prev => ({ ...prev, plusOneName: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: '1px solid #d8cfc2',
                      fontSize: '0.9rem',
                      fontFamily: 'sans-serif'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Diet choice */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#6b6257', marginBottom: '0.4rem', fontFamily: 'sans-serif' }}>
                Wybór Menu Weselnego
              </label>
              <select 
                value={rsvpData.diet}
                onChange={(e) => setRsvpData(prev => ({ ...prev, diet: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid #d8cfc2',
                  fontSize: '0.95rem',
                  fontFamily: 'sans-serif',
                  background: '#fff'
                }}
              >
                <option value="Klasyczne">Klasyczne</option>
                <option value="Wegetariańskie">Wegetariańskie</option>
                <option value="Wegańskie">Wegańskie</option>
                <option value="Bezglutenowe">Bezglutenowe / Alergie</option>
              </select>
            </div>

            {/* Allergies */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#6b6257', marginBottom: '0.4rem', fontFamily: 'sans-serif' }}>
                Alergie pokarmowe lub uwagi
              </label>
              <input 
                type="text"
                placeholder="np. bez orzechów, bez laktozy"
                value={rsvpData.allergies}
                onChange={(e) => setRsvpData(prev => ({ ...prev, allergies: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.7rem',
                  borderRadius: '10px',
                  border: '1px solid #d8cfc2',
                  fontSize: '0.95rem',
                  fontFamily: 'sans-serif'
                }}
              />
            </div>

            {/* Accommodation checkbox */}
            <div style={{ background: '#faf8f4', padding: '1rem', borderRadius: '12px', border: '1px solid #efe8dc' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontFamily: 'sans-serif', fontSize: '0.95rem' }}>
                <input 
                  type="checkbox"
                  checked={rsvpData.accommodation}
                  onChange={(e) => setRsvpData(prev => ({ ...prev, accommodation: e.target.checked }))}
                  style={{ width: '18px', height: '18px', accentColor: '#b85a1f' }}
                />
                <span>Potrzebuję noclegu w hotelu weselnym</span>
              </label>
            </div>

            <button 
              type="submit"
              style={{
                width: '100%',
                padding: '0.9rem',
                borderRadius: '12px',
                border: 'none',
                background: '#b85a1f',
                color: '#fff',
                fontWeight: 600,
                fontSize: '1rem',
                fontFamily: 'sans-serif',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginTop: '0.5rem',
                textAlign: 'center'
              }}
            >
              Kontynuuj
            </button>
          </form>
        )}

        {/* STEP 4: Wishes Message */}
        {step === 4 && (
          <form onSubmit={handleFinalSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 400, color: '#2f2a24', margin: 0 }}>
              Wiadomość dla Pary Młodej
            </h2>
            <p style={{ fontFamily: 'sans-serif', fontSize: '0.9rem', color: '#6b6257', margin: 0 }}>
              Możesz dodać krótkie słowo dla nas lub życzenia, które odczytamy przed ślubem.
            </p>
            
            <textarea 
              rows={4}
              placeholder="Twoja wiadomość..."
              value={rsvpData.message}
              onChange={(e) => setRsvpData(prev => ({ ...prev, message: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '12px',
                border: '1px solid #d8cfc2',
                fontSize: '0.95rem',
                fontFamily: 'sans-serif',
                resize: 'vertical',
                background: '#fffdfa'
              }}
            />
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              {rsvpData.attending && (
                <button 
                  type="button"
                  onClick={() => setStep(3)}
                  style={{
                    flex: '1',
                    padding: '0.85rem',
                    borderRadius: '12px',
                    border: '1px solid #d8cfc2',
                    background: '#fff',
                    color: '#6b6257',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'sans-serif'
                  }}
                >
                  Cofnij
                </button>
              )}
              
              <button 
                type="submit"
                style={{
                  flex: '2',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#b85a1f',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '1rem',
                  fontFamily: 'sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(184, 90, 31, 0.15)'
                }}
              >
                Prześlij RSVP ✨
              </button>
            </div>
          </form>
        )}

        {/* STEP 5: Success thank you */}
        {step === 5 && (
          <div style={{ display: 'grid', gap: '1.5rem', animation: 'fadeIn 0.6s ease' }}>
            <div style={{
              fontSize: '4.5rem',
              color: '#b85a1f',
              margin: '1rem 0 0.5rem 0',
              animation: 'scaleUp 0.5s ease-out'
            }}>
              {rsvpData.attending ? '💖' : '✉️'}
            </div>
            
            <h2 style={{ fontSize: '2rem', fontWeight: 400, color: '#2f2a24', margin: 0 }}>
              Dziękujemy za Odpowiedź!
            </h2>
            
            {rsvpData.attending ? (
              <p style={{ fontSize: '1.15rem', color: '#35684f', lineHeight: '1.6' }}>
                Twoje potwierdzenie zostało pomyślnie zapisane. <br />
                <strong>Do zobaczenia 15 Sierpnia 2026 roku!</strong>
              </p>
            ) : (
              <p style={{ fontSize: '1.1rem', color: '#8c5a12', lineHeight: '1.6' }}>
                Przykro nam, że nie będziesz mógł/mogła nam towarzyszyć. Twoja odpowiedź została zapisana w naszym planerze.
              </p>
            )}

            <div style={{ width: '60px', height: '1px', background: '#d4af37', margin: '0.5rem auto' }} />

            <p style={{ fontFamily: 'sans-serif', fontSize: '0.85rem', color: '#6b6257', lineHeight: '1.5', padding: '0 1rem' }}>
              Dane zostaną zaktualizowane w panelu Pary Młodej automatycznie.
            </p>

            <div style={{ marginTop: '1rem' }}>
              <Link 
                to="/"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 2rem',
                  borderRadius: '999px',
                  background: '#f0e6d8',
                  color: 'var(--text)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  fontFamily: 'sans-serif',
                  transition: 'all 0.2s'
                }}
              >
                Przejdź do Strony Głównej
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
