import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { createEvent, getEvents, toWedding } from '../../../api/eventApi'
import { setActiveWeddingId, setEvents, setEventsError, setEventsLoading } from '../../../store/slices/authSlice'
import type { RootState } from '../../../store'

function parseCoupleNames(fullName: string | undefined): { partnerA: string; partnerB: string } {
  if (!fullName || fullName === 'Użytkownik') {
    return { partnerA: '', partnerB: '' }
  }

  const name = fullName.trim()

  const splitters = [
    /\s*&\s*/,
    /\s+i\s+/i,
    /\s+and\s+/i,
    /\s*\+\s*/,
    /\s+plus\s+/i,
    /\s*,\s*/,
    /\s*\/\s*/
  ]

  for (const regex of splitters) {
    const parts = name.split(regex)
    if (parts.length >= 2) {
      const partnerA = parts[0].trim()
      const partnerB = parts.slice(1).join(' ').trim()
      if (partnerA && partnerB) {
        return { partnerA, partnerB }
      }
    }
  }

  const words = name.split(/\s+/)
  if (words.length === 2) {
    return { partnerA: words[0].trim(), partnerB: words[1].trim() }
  }

  return { partnerA: name, partnerB: '' }
}

export function CreateEventPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { user, token } = useSelector((state: RootState) => state.auth)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const parsedNames = parseCoupleNames(user?.name)

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    partnerA: parsedNames.partnerA,
    partnerB: parsedNames.partnerB,
    date: user?.weddingDate || '',
    venue: '',
    budget: 50000,
    guestsCount: 100,
    style: 'glamour'
  })

  const stylesList = [
    { value: 'glamour', label: t('createEvent.styles.glamour.name'), desc: t('createEvent.styles.glamour.desc'), icon: '✨' },
    { value: 'boho', label: t('createEvent.styles.boho.name'), desc: t('createEvent.styles.boho.desc'), icon: '🌿' },
    { value: 'rustic', label: t('createEvent.styles.rustic.name'), desc: t('createEvent.styles.rustic.desc'), icon: '🪵' },
    { value: 'classic', label: t('createEvent.styles.classic.name'), desc: t('createEvent.styles.classic.desc'), icon: '🌹' }
  ]

  const stepLabels = [
    t('createEvent.stepBasic'),
    t('createEvent.stepBudget'),
    t('createEvent.stepStyle'),
    t('createEvent.stepSummary')
  ]

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

    const weddingName = `${formData.partnerA} & ${formData.partnerB || t('createEvent.defaultPartner')}`

    try {
      const createdEvent = await createEvent({
        name: weddingName,
        eventDate: `${formData.date}T00:00:00`,
        location: formData.venue || t('createEvent.notSpecified'),
        status: 'PLANNED',
      }, { token: token ?? undefined })

      dispatch(setEventsLoading())
      const events = await getEvents({ token: token ?? undefined })
      dispatch(setEvents(events.map(toWedding)))
      dispatch(setActiveWeddingId(createdEvent.id))
      navigate('/')
    } catch {
      const message = t('createEvent.saveError')
      setSaveError(message)
      dispatch(setEventsError(message))
    } finally {
      setIsSaving(false)
    }
  }

  const selectedStyle = stylesList.find(styleObj => styleObj.value === formData.style)

  return (
    <div style={{ maxWidth: '650px', margin: '2rem auto', padding: '1rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--primary)', fontWeight: 600 }}>{t('createEvent.tag')}</span>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2.4rem', margin: '0.5rem 0', fontWeight: 500 }}>{t('createEvent.title')}</h1>
        <p style={{ color: 'var(--muted)', margin: 0 }}>{t('createEvent.subtitle')}</p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '2px', background: 'var(--border)', zIndex: 1 }} />
        <div style={{ position: 'absolute', top: '15px', left: '0', width: `${((step - 1) / 3) * 100}%`, height: '2px', background: 'var(--primary)', zIndex: 2, transition: 'width 0.4s ease' }} />

        {[1, 2, 3, 4].map((s) => (
          <div key={s} style={{ zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: step >= s ? 'var(--primary)' : 'var(--surface-soft)',
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
              {stepLabels[s - 1]}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="page-card" style={{ background: 'var(--surface)', padding: '2.5rem', borderRadius: '20px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
        {saveError && (
          <p style={{ margin: '0 0 1.5rem', padding: '0.8rem 1rem', borderRadius: '10px', background: 'var(--danger-soft)', color: 'var(--danger)' }}>
            {saveError}
          </p>
        )}

        {step === 1 && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', margin: '0 0 0.5rem 0', fontFamily: 'Georgia, serif', fontWeight: 500 }}>{t('createEvent.step1Title')}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>{t('createEvent.partnerA')}</label>
                <input type="text" name="partnerA" value={formData.partnerA} onChange={handleChange} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t('createEvent.partnerB')}</label>
                <input type="text" name="partnerB" value={formData.partnerB} onChange={handleChange} required style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>{t('createEvent.date')}</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>{t('createEvent.venue')}</label>
              <input type="text" name="venue" placeholder={t('createEvent.venuePlaceholder')} value={formData.venue} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', margin: '0 0 0.5rem 0', fontFamily: 'Georgia, serif', fontWeight: 500 }}>{t('createEvent.step2Title')}</h2>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.85rem' }}>{t('createEvent.helperNotSaved')}</p>

            <div>
              <label style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between' }}>
                <span>{t('createEvent.totalBudget')}</span>
                <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{formData.budget.toLocaleString()} PLN</strong>
              </label>
              <input type="range" name="budget" min="10000" max="250000" step="5000" value={formData.budget} onChange={handleChange} style={{ width: '100%', accentColor: 'var(--primary)' }} />
              <div style={rangeLabelsStyle}>
                <span>{t('createEvent.budgetMin')}</span>
                <span>{t('createEvent.budgetMid')}</span>
                <span>{t('createEvent.budgetMax')}</span>
              </div>
            </div>

            <div>
              <label style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between' }}>
                <span>{t('createEvent.estimatedGuests')}</span>
                <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{t('createEvent.peopleCount', { count: formData.guestsCount })}</strong>
              </label>
              <input type="range" name="guestsCount" min="10" max="350" step="5" value={formData.guestsCount} onChange={handleChange} style={{ width: '100%', accentColor: 'var(--primary)' }} />
              <div style={rangeLabelsStyle}>
                <span>{t('createEvent.peopleCount', { count: 10 })}</span>
                <span>{t('createEvent.peopleCount', { count: 180 })}</span>
                <span>{t('createEvent.peopleCount', { count: 350 })}</span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.3rem', margin: '0 0 1rem 0', fontFamily: 'Georgia, serif', fontWeight: 500 }}>{t('createEvent.step3Title')}</h2>
            <p style={{ margin: '0 0 1rem', color: 'var(--muted)', fontSize: '0.85rem' }}>{t('createEvent.styleNotSaved')}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {stylesList.map((styleObj) => {
                const selected = formData.style === styleObj.value
                return (
                  <div
                    key={styleObj.value}
                    onClick={() => selectStyle(styleObj.value)}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '12px',
                      border: `2px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
                      background: selected ? 'var(--primary-soft)' : 'var(--surface-soft)',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      transform: selected ? 'scale(1.02)' : 'none',
                      boxShadow: selected ? '0 6px 15px rgba(184, 90, 31, 0.1)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{styleObj.icon}</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--text)' }}>{styleObj.label}</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)', lineHeight: '1.4' }}>{styleObj.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', margin: '0 0 0.5rem 0', fontFamily: 'Georgia, serif', fontWeight: 500 }}>{t('createEvent.step4Title')}</h2>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.85rem' }}>{t('createEvent.summaryBackendNote')}</p>

            <div style={{ background: 'var(--bg-accent)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'grid', gap: '1rem' }}>
              <SummaryRow label={t('createEvent.summaryCouple')} value={`${formData.partnerA} & ${formData.partnerB}`} />
              <SummaryRow label={t('createEvent.date')} value={formData.date} />
              <SummaryRow label={t('createEvent.location')} value={formData.venue || t('createEvent.notSpecified')} />
              <SummaryRow label={t('createEvent.budget')} value={`${formData.budget.toLocaleString()} PLN`} highlight />
              <SummaryRow label={t('createEvent.guestsCount')} value={t('createEvent.peopleCount', { count: formData.guestsCount })} />
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.25rem', gap: '1rem' }}>
                <span style={{ color: 'var(--muted)' }}>{t('createEvent.mainStyle')}</span>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', background: 'var(--primary-soft)', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}>
                  {selectedStyle?.label ?? formData.style}
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>{t('createEvent.createHint')}</p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          {step > 1 ? (
            <button type="button" onClick={handlePrev} style={secondaryButtonStyle}>
              {t('common.back')}
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
                ...primaryButtonStyle,
                padding: '0.75rem 1.8rem',
                background: step === 1 && (!formData.partnerA || !formData.partnerB || !formData.date) ? 'var(--border)' : 'var(--primary)',
                cursor: step === 1 && (!formData.partnerA || !formData.partnerB || !formData.date) ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 10px rgba(184, 90, 31, 0.15)'
              }}
            >
              {t('schedule.next')}
            </button>
          ) : (
            <button type="submit" disabled={isSaving} style={{ ...primaryButtonStyle, padding: '0.75rem 2.2rem', cursor: isSaving ? 'wait' : 'pointer', opacity: isSaving ? 0.7 : 1, boxShadow: '0 6px 15px rgba(184, 90, 31, 0.25)' }}>
              {isSaving ? t('common.saving') : t('createEvent.submit')}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

function SummaryRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '0.75rem', gap: '1rem' }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <strong style={{ color: highlight ? 'var(--primary)' : 'var(--text)', textAlign: 'right' }}>{value}</strong>
    </div>
  )
}

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: 600,
  marginBottom: '0.5rem',
  color: 'var(--muted)'
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '10px',
  border: '1px solid var(--border)',
  fontSize: '0.95rem'
}

const rangeLabelsStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.75rem',
  color: 'var(--muted)',
  marginTop: '0.25rem'
}

const secondaryButtonStyle: CSSProperties = {
  padding: '0.75rem 1.5rem',
  borderRadius: '10px',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--muted)',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
}

const primaryButtonStyle: CSSProperties = {
  borderRadius: '10px',
  border: 'none',
  background: 'var(--primary)',
  color: '#fff',
  fontWeight: 700,
  transition: 'all 0.2s ease'
}
