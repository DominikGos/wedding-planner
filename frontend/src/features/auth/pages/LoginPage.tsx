import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { login, registerCouple } from '../../../store/slices/authSlice'

export function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register Form State
  const [coupleName, setCoupleName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [weddingDate, setWeddingDate] = useState('')

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if it's a planner email to mock planner login
    const isPlanner = loginEmail.toLowerCase().includes('planner')
    
    dispatch(login({
      name: isPlanner ? 'Anna Kowalska' : 'Maria & Jakub',
      email: loginEmail,
      role: isPlanner ? 'planner' : 'couple'
    }))
    
    navigate('/')
  }

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    dispatch(registerCouple({
      coupleName,
      email: registerEmail,
      weddingDate
    }))
    
    // Automatically redirect to the wedding creator page since they don't have a wedding yet!
    navigate('/events/new')
  }

  // Helper quick login buttons
  const handleQuickLogin = (role: 'couple' | 'planner') => {
    if (role === 'couple') {
      dispatch(login({
        name: 'Maria & Jakub',
        email: 'maria.jakub@example.com',
        role: 'couple'
      }))
    } else {
      dispatch(login({
        name: 'Anna Kowalska',
        email: 'anna.planner@example.com',
        role: 'planner'
      }))
    }
    navigate('/')
  }

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google'
  }

  return (
    <div style={{ maxWidth: '480px', margin: '3rem auto', padding: '1rem' }}>
      
      {/* Decorative Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>✨</span>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2.2rem', margin: '0.5rem 0', fontWeight: 500, color: 'var(--text)' }}>
          Wedding Planner
        </h1>
        <p style={{ color: 'var(--muted)', margin: 0, fontSize: '0.95rem' }}>
          Twój osobisty planer ślubu i wesela klasy Premium.
        </p>
      </div>

      <div style={{
        background: '#fff',
        borderRadius: '20px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        overflow: 'hidden'
      }}>
        
        {/* Tabs switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => setActiveTab('login')}
            style={{
              flex: 1,
              padding: '1.1rem',
              background: activeTab === 'login' ? '#fff' : '#fcfaf6',
              border: 'none',
              borderBottom: activeTab === 'login' ? '2px solid var(--primary)' : 'none',
              fontSize: '1rem',
              fontWeight: 600,
              color: activeTab === 'login' ? 'var(--primary)' : 'var(--muted)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Zaloguj się
          </button>
          
          <button
            onClick={() => setActiveTab('register')}
            style={{
              flex: 1,
              padding: '1.1rem',
              background: activeTab === 'register' ? '#fff' : '#fcfaf6',
              border: 'none',
              borderBottom: activeTab === 'register' ? '2px solid var(--primary)' : 'none',
              fontSize: '1rem',
              fontWeight: 600,
              color: activeTab === 'register' ? 'var(--primary)' : 'var(--muted)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Zarejestruj się
          </button>
        </div>

        {/* Form area */}
        <div style={{ padding: '2.2rem' }}>
          {activeTab === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--muted)' }}>
                  Adres E-mail
                </label>
                <input
                  type="email"
                  placeholder="np. maria.jakub@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    fontSize: '0.95rem',
                    background: '#fffdf9',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--muted)' }}>
                  Hasło
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    fontSize: '0.95rem',
                    background: '#fffdf9',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ textAlign: 'right', marginTop: '-0.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)', cursor: 'pointer', textDecoration: 'underline' }}>
                  Zapomniałeś hasła?
                </span>
              </div>

              <button
                type="submit"
                style={{
                  padding: '0.8rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(184, 90, 31, 0.15)',
                  marginTop: '0.5rem',
                  transition: 'all 0.2s'
                }}
              >
                Zaloguj się
              </button>
              <button
                type="button"
                onClick={handleGoogleLogin}
                style={{
                  padding: '0.8rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: '#fff',
                  color: 'var(--text)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(47, 42, 36, 0.06)',
                  transition: 'all 0.2s'
                }}
              >
                Zaloguj przez Google
              </button>
            </form>
          ) : (
            /* REGISTER FORM - ONLY COUPLE */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--muted)' }}>
                  Imiona Pary Młodej
                </label>
                <input
                  type="text"
                  placeholder="np. Katarzyna & Tomasz"
                  value={coupleName}
                  onChange={(e) => setCoupleName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    fontSize: '0.95rem',
                    background: '#fffdf9',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--muted)' }}>
                  Adres E-mail
                </label>
                <input
                  type="email"
                  placeholder="np. tomek.kasia@example.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    fontSize: '0.95rem',
                    background: '#fffdf9',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--muted)' }}>
                  Hasło
                </label>
                <input
                  type="password"
                  placeholder="Minimum 6 znaków"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    fontSize: '0.95rem',
                    background: '#fffdf9',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--muted)' }}>
                  Planowana Data Ślubu (opcjonalnie)
                </label>
                <input
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    fontSize: '0.95rem',
                    background: '#fffdf9',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: '0.8rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(184, 90, 31, 0.15)',
                  marginTop: '0.5rem',
                  transition: 'all 0.2s'
                }}
              >
                Zarejestruj i Stwórz Planer
              </button>
            </form>
          )}

          {/* Quick Mock Login buttons (Gold/Rose Theme) */}
          <div style={{ marginTop: '2.2rem', paddingTop: '1.8rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: '0.9rem' }}>
              Szybkie Logowanie Testowe
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                onClick={() => handleQuickLogin('couple')}
                style={{
                  padding: '0.65rem 0.5rem',
                  borderRadius: '10px',
                  border: '1px solid var(--primary)',
                  background: 'var(--primary-soft)',
                  color: 'var(--primary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                👰‍♀️🤵‍♂️ Para Młoda
              </button>

              <button
                onClick={() => handleQuickLogin('planner')}
                style={{
                  padding: '0.65rem 0.5rem',
                  borderRadius: '10px',
                  border: '1px solid var(--muted)',
                  background: '#fff',
                  color: 'var(--text)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fbf9f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >
                💼 Wedding Planner
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
