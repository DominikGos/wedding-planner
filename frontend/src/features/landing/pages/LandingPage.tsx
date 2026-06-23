import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function LandingPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const currentTab = searchParams.get('tab') || 'about'

  return (
    <div className='public-page' style={{ display: 'grid', gap: '2.5rem' }}>
      <section className="landing-hero" style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #fffcf6 0%, #f7f1e5 50%, #efe7dc 100%)',
        borderRadius: '16px',
        border: '1px solid color-mix(in srgb, var(--border) 70%, transparent)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="decorative-flower" style={{ position: 'absolute', top: '14px', left: '18px', fontSize: '2.6rem', transform: 'rotate(-18deg)' }}>
          <span className="decorative-flower-light">🌸</span>
          <span className="decorative-flower-dark">🥀</span>
        </div>
        <div className="decorative-flower" style={{ position: 'absolute', bottom: '14px', right: '18px', fontSize: '2.6rem', transform: 'rotate(16deg)' }}>
          <span className="decorative-flower-light">🌸</span>
          <span className="decorative-flower-dark">🥀</span>
        </div>

        <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--primary)', fontWeight: 600 }}>
          {t('landing.welcome')}
        </span>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '3rem',
          margin: '0.75rem 0',
          fontWeight: 400,
          lineHeight: 1.2,
          color: 'var(--text)'
        }}>
          {t('landing.title')}
        </h1>
        <p style={{ maxWidth: '600px', margin: '1rem auto 2rem', color: 'var(--muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
          {t('landing.subtitle')}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/auth" style={{
            padding: '0.8rem 2rem',
            borderRadius: '999px',
            background: 'var(--primary)',
            color: 'var(--on-primary)',
            fontWeight: 600,
            boxShadow: '0 6px 20px rgba(184, 90, 31, 0.2)'
          }}>
            {t('landing.startBtn')}
          </Link>
          <Link to="/rsvp" style={{
            padding: '0.8rem 2rem',
            borderRadius: '999px',
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            fontWeight: 600
          }}>
            {t('landing.rsvpBtn')}
          </Link>
        </div>
      </section>

      <section className="page-card" style={{ padding: '2.5rem' }}>
        {currentTab === 'about' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            <div>
              <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                {t('landing.aboutSection.tag')}
              </span>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2rem', margin: '0.5rem 0 1rem', fontWeight: 400 }}>
                {t('landing.aboutSection.title')}
              </h2>
              <p style={{ color: 'var(--muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                {t('landing.aboutSection.text1')}
              </p>
              <p style={{ color: 'var(--muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                {t('landing.aboutSection.text2')}
              </p>
            </div>
            <div style={{ background: 'var(--bg-accent)', padding: '2rem', borderRadius: '16px', border: '1px dashed var(--border)' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontFamily: 'Georgia, serif', fontWeight: 500 }}>
                {t('landing.aboutSection.whyTitle')}
              </h3>
              <ul style={{ paddingLeft: '1.2rem', display: 'grid', gap: '0.75rem', color: 'var(--text)', fontSize: '0.9rem' }}>
                <li>{t('landing.aboutSection.why1')}</li>
                <li>{t('landing.aboutSection.why2')}</li>
                <li>{t('landing.aboutSection.why3')}</li>
                <li>{t('landing.aboutSection.why4')}</li>
              </ul>
            </div>
          </div>
        )}

        {currentTab === 'services' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                {t('landing.servicesSection.tag')}
              </span>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2rem', margin: '0.5rem 0 0.5rem', fontWeight: 400 }}>
                {t('landing.servicesSection.title')}
              </h2>
              <p style={{ color: 'var(--muted)', margin: 0 }}>
                {t('landing.servicesSection.subtitle')}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              <div style={{ border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '12px', background: 'var(--surface)' }}>
                <span style={{ fontSize: '2rem' }}>📅</span>
                <h3 style={{ margin: '0.75rem 0 0.5rem', fontSize: '1.15rem' }}>
                  {t('landing.servicesSection.item1Title')}
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                  {t('landing.servicesSection.item1Text')}
                </p>
              </div>
              <div style={{ border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '12px', background: 'var(--surface)' }}>
                <span style={{ fontSize: '2rem' }}>💰</span>
                <h3 style={{ margin: '0.75rem 0 0.5rem', fontSize: '1.15rem' }}>
                  {t('landing.servicesSection.item2Title')}
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                  {t('landing.servicesSection.item2Text')}
                </p>
              </div>
              <div style={{ border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '12px', background: 'var(--surface)' }}>
                <span style={{ fontSize: '2rem' }}>🍷</span>
                <h3 style={{ margin: '0.75rem 0 0.5rem', fontSize: '1.15rem' }}>
                  {t('landing.servicesSection.item3Title')}
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                  {t('landing.servicesSection.item3Text')}
                </p>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'gallery' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                {t('landing.gallerySection.tag')}
              </span>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2rem', margin: '0.5rem 0 0.5rem', fontWeight: 400 }}>
                {t('landing.gallerySection.title')}
              </h2>
              <p style={{ color: 'var(--muted)', margin: 0 }}>
                {t('landing.gallerySection.subtitle')}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {[
                { name: t('landing.gallerySection.item1'), style: t('landing.gallerySection.item1Style'), icon: '🪵' },
                { name: t('landing.gallerySection.item2'), style: t('landing.gallerySection.item2Style'), icon: '✨' },
                { name: t('landing.gallerySection.item3'), style: t('landing.gallerySection.item3Style'), icon: '🌾' },
                { name: t('landing.gallerySection.item4'), style: t('landing.gallerySection.item4Style'), icon: '🌹' }
              ].map((item, idx) => (
                <div key={idx} style={{
                  padding: '2rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                  background: 'linear-gradient(to bottom, var(--surface), var(--surface-soft))',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '2.5rem' }}>{item.icon}</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text)' }}>{item.name}</strong>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '20px', background: 'var(--primary-soft)', color: 'var(--primary)', fontWeight: 600 }}>{item.style}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'contact' && (
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                {t('landing.contactSection.tag')}
              </span>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2rem', margin: '0.5rem 0 0.5rem', fontWeight: 400 }}>
                {t('landing.contactSection.title')}
              </h2>
              <p style={{ color: 'var(--muted)', margin: 0 }}>
                {t('landing.contactSection.subtitle')}
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); alert(t('landing.contactSection.alertSuccess')); }} style={{ display: 'grid', gap: '1rem' }}>
              <input
                type="text"
                placeholder={t('landing.contactSection.namePlaceholder')}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
              />
              <input
                type="email"
                placeholder={t('landing.contactSection.emailPlaceholder')}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
              />
              <textarea
                rows={4}
                placeholder={t('landing.contactSection.messagePlaceholder')}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', resize: 'vertical' }}
              />
              <button type="submit" style={{ padding: '0.8rem', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 600, cursor: 'pointer' }}>
                {t('landing.contactSection.submitBtn')}
              </button>
            </form>
          </div>
        )}
      </section>
    </div>
  )
}
