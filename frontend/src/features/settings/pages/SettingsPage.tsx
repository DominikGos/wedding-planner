import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import type { RootState } from '../../../store'
import { logout } from '../../../store/slices/authSlice'

type ThemeName = 'light' | 'dark'

export function SettingsPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation()
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
        <h1 className='page-title'>{t('settings.title')}</h1>
        <p className='page-subtitle'>{t('settings.subtitle')}</p>
      </header>

      <div className='settings-grid'>
        <div className='settings-column'>
          <article className='page-card settings-card settings-theme-card'>
            <h2>{t('settings.themeTitle')}</h2>
            <p className='page-subtitle'>{t('settings.themeSubtitle')}</p>

            <div className='theme-choice-row'>
              <button
                type='button'
                className={theme === 'light' ? 'theme-choice theme-choice-active' : 'theme-choice'}
                onClick={() => setTheme('light')}
              >
                {t('settings.themeLight')}
              </button>
              <button
                type='button'
                className={theme === 'dark' ? 'theme-choice theme-choice-active' : 'theme-choice'}
                onClick={() => setTheme('dark')}
              >
                {t('settings.themeDark')}
              </button>
            </div>

            <div className='theme-preview'>
              <span />
              <strong>{theme === 'dark' ? t('settings.themePreviewDark') : t('settings.themePreviewLight')}</strong>
              <small>{t('settings.themeSaveNote')}</small>
            </div>
          </article>

          <article className='page-card settings-card settings-lang-card' style={{ marginTop: '1.5rem' }}>
            <h2>{t('settings.langTitle')}</h2>
            <p className='page-subtitle'>{t('settings.langSubtitle')}</p>

            <div className='theme-choice-row'>
              <button
                type='button'
                className={i18n.language === 'pl' ? 'theme-choice theme-choice-active' : 'theme-choice'}
                onClick={() => i18n.changeLanguage('pl')}
              >
                🇵🇱 {t('settings.langPL')}
              </button>
              <button
                type='button'
                className={i18n.language === 'en' ? 'theme-choice theme-choice-active' : 'theme-choice'}
                onClick={() => i18n.changeLanguage('en')}
              >
                🇬🇧 {t('settings.langEN')}
              </button>
            </div>
          </article>

          <article className='page-card settings-card settings-account-actions' style={{ marginTop: '1.5rem' }}>
            <h2>{t('settings.accountTitle')}</h2>
            <p className='page-subtitle'>{t('settings.accountSubtitle')}</p>
            <button type='button' className='button-secondary settings-logout-button' onClick={handleLogout}>
              {t('settings.logoutButton')}
            </button>
          </article>
        </div>

        <div className='settings-column'>
          <article className='page-card settings-card'>
            <h2>{t('settings.detailsTitle')}</h2>
            <dl className='settings-details'>
              <div>
                <dt>{t('settings.detailName')}</dt>
                <dd>{user.name || user.email?.split('@')[0] || t('common.user')}</dd>
              </div>
              <div>
                <dt>{t('settings.detailEmail')}</dt>
                <dd>{user.email || 'Brak adresu email'}</dd>
              </div>
              <div>
                <dt>{t('settings.detailRole')}</dt>
                <dd>{user.role === 'planner' ? t('settings.rolePlanner') : t('settings.roleCouple')}</dd>
              </div>
            </dl>
          </article>

          <article className='page-card settings-card'>
            <h2>{t('settings.activeEventTitle')}</h2>
            <dl className='settings-details'>
              <div>
                <dt>{t('settings.detailEventName')}</dt>
                <dd>{activeWedding?.name ?? t('settings.noActiveEvent')}</dd>
              </div>
              <div>
                <dt>{t('settings.detailEventDate')}</dt>
                <dd>{activeWedding?.date ?? '-'}</dd>
              </div>
              <div>
                <dt>{t('settings.detailEventVenue')}</dt>
                <dd>{activeWedding?.venue ?? '-'}</dd>
              </div>
            </dl>
          </article>
        </div>
      </div>
    </section>
  )
}
