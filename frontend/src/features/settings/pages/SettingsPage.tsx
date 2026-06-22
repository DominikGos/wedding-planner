import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../../store'
import { logout } from '../../../store/slices/authSlice'

type ThemeName = 'light' | 'dark'

export function SettingsPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, activeWeddingId, weddings } = useSelector((state: RootState) => state.auth)
  const activeWedding = weddings.find(wedding => wedding.id === activeWeddingId)
  const [theme, setTheme] = useState<ThemeName>(() => (
    localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
  ))

  useEffect(() => {
    localStorage.setItem('theme', theme)
    window.dispatchEvent(new Event('theme:change'))
  }, [theme])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  if (!user) {
    return <Navigate to='/auth' replace />
  }

  return (
    <section className='settings-page'>
      <header>
        <h1 className='page-title'>Ustawienia</h1>
        <p className='page-subtitle'>Dostosuj wygląd aplikacji i sprawdź podstawowe dane konta.</p>
      </header>

      <div className='settings-grid'>
        <div className='settings-column'>
          <article className='page-card settings-card settings-theme-card'>
            <h2>Motyw aplikacji</h2>
            <p className='page-subtitle'>Wybierz jasny albo ciemny wygląd panelu.</p>

            <div className='theme-choice-row'>
              <button
                type='button'
                className={theme === 'light' ? 'theme-choice theme-choice-active' : 'theme-choice'}
                onClick={() => setTheme('light')}
              >
                Jasny
              </button>
              <button
                type='button'
                className={theme === 'dark' ? 'theme-choice theme-choice-active' : 'theme-choice'}
                onClick={() => setTheme('dark')}
              >
                Ciemny
              </button>
            </div>

            <div className='theme-preview'>
              <span />
              <strong>{theme === 'dark' ? 'Elegancki ciemny motyw' : 'Klasyczny jasny motyw'}</strong>
              <small>Motyw zostanie zapamiętany po odświeżeniu strony.</small>
            </div>
          </article>

          <article className='page-card settings-card settings-account-actions'>
            <h2>Konto</h2>
            <p className='page-subtitle'>Możesz zakończyć sesję i wrócić do strony głównej.</p>
            <button type='button' className='button-secondary settings-logout-button' onClick={handleLogout}>
              Wyloguj się
            </button>
          </article>
        </div>

        <div className='settings-column'>
          <article className='page-card settings-card'>
            <h2>Szczegóły konta</h2>
            <dl className='settings-details'>
              <div>
                <dt>Nazwa</dt>
                <dd>{user.name || user.email?.split('@')[0] || 'Użytkownik'}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{user.email || 'Brak adresu email'}</dd>
              </div>
              <div>
                <dt>Rola</dt>
                <dd>{user.role === 'planner' ? 'Wedding Planner' : 'Para Młoda'}</dd>
              </div>
            </dl>
          </article>

          <article className='page-card settings-card'>
            <h2>Aktywne wydarzenie</h2>
            <dl className='settings-details'>
              <div>
                <dt>Nazwa</dt>
                <dd>{activeWedding?.name ?? 'Brak aktywnego wesela'}</dd>
              </div>
              <div>
                <dt>Data</dt>
                <dd>{activeWedding?.date ?? '-'}</dd>
              </div>
              <div>
                <dt>Miejsce</dt>
                <dd>{activeWedding?.venue ?? '-'}</dd>
              </div>
            </dl>
          </article>
        </div>
      </div>
    </section>
  )
}
