import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { localAuthSuccess } from '../../../store/slices/authSlice'
import { loginLocal, registerLocal } from '../../../api/authApi'

export function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'register' ? 'register' : 'login'
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register Form State
  const [coupleName, setCoupleName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [weddingDate, setWeddingDate] = useState('')

  // Status State
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleTabChange = (tab: 'login' | 'register') => {
    setSearchParams({ tab })
    setError(null)
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Form Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(loginEmail)) {
      setError(t('loginPageErrors.invalidEmail'))
      return
    }
    if (!loginPassword) {
      setError(t('loginPageErrors.emptyPassword'))
      return
    }

    setIsLoading(true)
    try {
      const res = await loginLocal({ email: loginEmail, password: loginPassword })
      
      const mappedRole: 'couple' | 'planner' =
        res.role.toLowerCase() === 'planner' ? 'planner' : 'couple'

      dispatch(localAuthSuccess({
        token: res.token,
        email: res.email,
        role: mappedRole,
        name: res.name
      }))

      navigate('/')
    } catch (err: any) {
      setError(t('loginPageErrors.loginFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Form Validation
    if (!coupleName.trim()) {
      setError(t('loginPageErrors.emptyCoupleNames'))
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(registerEmail)) {
      setError(t('loginPageErrors.invalidEmail'))
      return
    }
    if (registerPassword.length < 6) {
      setError(t('loginPageErrors.shortPassword'))
      return
    }

    setIsLoading(true)
    try {
      const res = await registerLocal({
        email: registerEmail,
        password: registerPassword,
        name: coupleName,
        role: 'couple'
      })

      dispatch(localAuthSuccess({
        token: res.token,
        email: res.email,
        role: 'couple',
        name: res.name,
        weddingDate: weddingDate || undefined
      }))

      navigate('/events/new')
    } catch (err: any) {
      setError(t('loginPageErrors.registerFailed'))
    } finally {
      setIsLoading(false)
    }
  }



  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google'
  }

  return (
    <div className='public-page' style={{ maxWidth: '480px', margin: '3rem auto', padding: '1rem' }}>
      
      {/* Decorative Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>✨</span>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2.2rem', margin: '0.5rem 0', fontWeight: 500, color: 'var(--text)' }}>
          {t('loginPage.title')}
        </h1>
        <p style={{ color: 'var(--muted)', margin: 0, fontSize: '0.95rem' }}>
          {t('loginPage.subtitle')}
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
            onClick={() => handleTabChange('login')}
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
            {t('loginPage.loginTab')}
          </button>
          
          <button
            onClick={() => handleTabChange('register')}
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
            {t('loginPage.registerTab')}
          </button>
        </div>

        {/* Form area */}
        <div style={{ padding: '2.2rem' }}>
          {error && (
            <div style={{
              padding: '0.8rem 1rem',
              borderRadius: '10px',
              background: '#fff0f0',
              color: '#a33',
              fontSize: '0.9rem',
              marginBottom: '1.25rem',
              border: '1px solid #ffa3a3',
              fontWeight: 500
            }}>
              {error}
            </div>
          )}

          {activeTab === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--muted)' }}>
                  {t('loginPage.emailLabel')}
                </label>
                <input
                  type="email"
                  placeholder={t('loginPage.emailPlaceholder')}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  disabled={isLoading}
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
                  {t('loginPage.passwordLabel')}
                </label>
                <input
                  type="password"
                  placeholder={t('loginPage.passwordPlaceholder')}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  disabled={isLoading}
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
                  {t('loginPage.forgotPassword')}
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: '0.8rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: isLoading ? 'var(--border)' : 'var(--primary)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(184, 90, 31, 0.15)',
                  marginTop: '0.5rem',
                  transition: 'all 0.2s',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? t('loginPage.loginLoading') : t('loginPage.loginSubmit')}
              </button>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                style={{
                  padding: '0.8rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: '#fff',
                  color: 'var(--text)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(47, 42, 36, 0.06)',
                  transition: 'all 0.2s'
                }}
              >
                {t('loginPage.loginGoogle')}
              </button>
            </form>
          ) : (
            /* REGISTER FORM - ONLY COUPLE */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--muted)' }}>
                  {t('loginPage.coupleNameLabel')}
                </label>
                <input
                  type="text"
                  placeholder={t('loginPage.coupleNamePlaceholder')}
                  value={coupleName}
                  onChange={(e) => setCoupleName(e.target.value)}
                  required
                  disabled={isLoading}
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
                  {t('loginPage.emailLabel')}
                </label>
                <input
                  type="email"
                  placeholder={t('loginPage.registerEmailPlaceholder')}
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  disabled={isLoading}
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
                  {t('loginPage.passwordLabel')}
                </label>
                <input
                  type="password"
                  placeholder={t('loginPage.registerPasswordPlaceholder')}
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  disabled={isLoading}
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
                  {t('loginPage.weddingDateLabel')}
                </label>
                <input
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  disabled={isLoading}
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
                disabled={isLoading}
                style={{
                  padding: '0.8rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: isLoading ? 'var(--border)' : 'var(--primary)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(184, 90, 31, 0.15)',
                  marginTop: '0.5rem',
                  transition: 'all 0.2s',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? t('loginPage.registerLoading') : t('loginPage.registerSubmit')}
              </button>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                style={{
                  padding: '0.8rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: '#fff',
                  color: 'var(--text)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(47, 42, 36, 0.06)',
                  transition: 'all 0.2s'
                }}
              >
                {t('loginPage.registerGoogle')}
              </button>
            </form>
          )}



        </div>

      </div>
    </div>
  )
}
