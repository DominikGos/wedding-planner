import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { findPublicRsvp, getPublicRsvp, updatePublicRsvp, type PublicRsvpResponse, type RsvpStatus } from '../../../api/rsvpApi'

function getStatusLabel(status: string | null | undefined, t: (key: string) => string) {
  const normalized = (status ?? '').toUpperCase()
  if (normalized === 'CONFIRMED') return t('rsvp.statusConfirmed')
  if (normalized === 'DECLINED' || normalized === 'REJECTED') return t('rsvp.statusDeclined')
  return t('rsvp.statusPending')
}

export function GuestRsvpPage() {
  const { t, i18n } = useTranslation()
  const { eventCode, guestCode } = useParams()
  const navigate = useNavigate()
  const [theme, setTheme] = useState(() => (
    localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
  ))
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
    const syncTheme = () => {
      setTheme(localStorage.getItem('theme') === 'dark' ? 'dark' : 'light')
    }
    window.addEventListener('theme:change', syncTheme)
    window.addEventListener('storage', syncTheme)
    return () => {
      window.removeEventListener('theme:change', syncTheme)
      window.removeEventListener('storage', syncTheme)
    }
  }, [])

  useEffect(() => {
    if (!eventCode || !guestCode) return

    getPublicRsvp(eventCode, guestCode)
      .then(found => {
        setInvitation(found)
        setAllergies(found.allergies ?? '')
        setDeclineReason(found.declineReason ?? '')
      })
      .catch(() => setError(t('rsvp.invalidLink')))
      .finally(() => setLoading(false))
  }, [eventCode, guestCode, t])

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
        ? t('rsvp.multipleFound')
        : message.includes('404')
          ? t('rsvp.notFound')
          : t('rsvp.checkError'))
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
      setMessage(status === 'CONFIRMED' ? t('rsvp.confirmedMessage') : t('rsvp.savedMessage'))
      window.setTimeout(() => navigate('/'), 1500)
    } catch {
      setError(t('rsvp.saveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <main data-theme={theme} className='public-page rsvp-page' style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, var(--bg-accent) 0%, var(--bg) 100%)', display: 'grid', placeItems: 'center', padding: '2rem 1rem' }}>
      <section style={{ width: 'min(560px, 100%)', background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '3rem 2rem', textAlign: 'center', display: 'grid', gap: '1.5rem' }}>
        <header className='rsvp-card-header'>
          <Link to='/' className='rsvp-back-link'>
            ← {t('common.back')}
          </Link>

          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--primary)', fontWeight: 600, textAlign: 'center' }}>
            {t('rsvp.title')}
          </span>
          <span className="decorative-flower" aria-hidden="true" style={{ position: 'absolute', top: '-1.4rem', right: '-0.6rem', fontSize: '2rem', transform: 'rotate(14deg)' }}>
            <span className="decorative-flower-light">🌸</span>
            <span className="decorative-flower-dark">🥀</span>
          </span>
        </header>

        {loading && <p>{t('rsvp.loading')}</p>}

        {!loading && !invitation && !eventCode && !guestCode && (
          <form onSubmit={findInvitation} style={{ display: 'grid', gap: '1rem', textAlign: 'left' }}>
            <label style={{ display: 'grid', gap: '0.35rem' }}>
              <span className='public-label'>{t('rsvp.inviteCode')}</span>
              <input required value={searchForm.eventCode} onChange={event => setSearchForm(current => ({ ...current, eventCode: event.target.value }))} style={inputStyle} />
            </label>
            <label style={{ display: 'grid', gap: '0.35rem' }}>
              <span className='public-label'>{t('rsvp.firstName')}</span>
              <input required value={searchForm.firstName} onChange={event => setSearchForm(current => ({ ...current, firstName: event.target.value }))} style={inputStyle} />
            </label>
            <label style={{ display: 'grid', gap: '0.35rem' }}>
              <span className='public-label'>{t('rsvp.lastName')}</span>
              <input required value={searchForm.lastName} onChange={event => setSearchForm(current => ({ ...current, lastName: event.target.value }))} style={inputStyle} />
            </label>
            {error && <p style={{ color: 'var(--danger)', fontWeight: 600, textAlign: 'center' }}>{error}</p>}
            <button type='submit' style={{ padding: '1rem', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 700, cursor: 'pointer' }}>
              {t('rsvp.findInvite')}
            </button>
          </form>
        )}

        {!loading && !invitation && eventCode && guestCode && (
          <>
            <p style={{ color: 'var(--danger)', fontWeight: 600 }}>{error ?? t('rsvp.invalidLink')}</p>
            <Link to='/' style={{ color: 'var(--muted)', textDecoration: 'underline' }}>{t('rsvp.backHome')}</Link>
          </>
        )}

        {!loading && invitation && (
          <>
            <header>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2.2rem', margin: '0 0 0.6rem', fontWeight: 400 }}>{invitation.eventName}</h1>
              <p style={{ color: 'var(--muted)', margin: 0 }}>
                {new Date(invitation.eventDate).toLocaleDateString(i18n.language === 'pl' ? 'pl-PL' : 'en-US')}
                {invitation.eventLocation ? `, ${invitation.eventLocation}` : ''}
              </p>
            </header>

            <div style={{ background: 'var(--surface-soft)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <strong style={{ display: 'block', fontSize: '1.25rem' }}>{t('rsvp.invitationFor', { name: invitation.guestName })}</strong>
              <span style={{ display: 'block', color: 'var(--muted)', marginTop: '0.25rem' }}>{t('rsvp.weddingLabel', { name: invitation.eventName })}</span>
              <span style={{ color: 'var(--muted)' }}>{t('rsvp.currentStatus', { status: getStatusLabel(invitation.rsvpStatus, t) })}</span>
            </div>

            <label style={{ display: 'grid', gap: '0.4rem', textAlign: 'left' }}>
              <span className='public-label'>{t('rsvp.allergies')}</span>
              <textarea
                value={allergies}
                onChange={event => setAllergies(event.target.value)}
                placeholder={t('rsvp.allergiesPlaceholder')}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </label>

            {declining && (
              <label style={{ display: 'grid', gap: '0.4rem', textAlign: 'left' }}>
                <span className='public-label'>{t('rsvp.declineReason')}</span>
                <textarea
                  value={declineReason}
                  onChange={event => setDeclineReason(event.target.value)}
                  placeholder={t('rsvp.declinePlaceholder')}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </label>
            )}

            {message && <p style={{ color: 'var(--ok)', fontWeight: 600 }}>{message}</p>}
            {error && <p style={{ color: 'var(--danger)', fontWeight: 600 }}>{error}</p>}

            <div style={{ display: 'grid', gap: '0.9rem' }}>
              <button type='button' disabled={saving} onClick={() => void saveStatus('CONFIRMED')} style={{ padding: '1rem', borderRadius: '12px', border: 'none', background: 'var(--ok)', color: 'var(--on-primary)', fontWeight: 700, cursor: 'pointer' }}>
                {t('rsvp.confirmPresence')}
              </button>
              <button type='button' disabled={saving} onClick={() => declining ? void saveStatus('DECLINED') : setDeclining(true)} style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--warning)', fontWeight: 700, cursor: 'pointer' }}>
                {declining ? t('rsvp.saveDecline') : t('rsvp.cannotAttend')}
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '0.8rem',
  borderRadius: '10px',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--text)',
}
