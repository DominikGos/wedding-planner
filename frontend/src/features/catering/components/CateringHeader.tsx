type CateringHeaderProps = {
  onBack: () => void
  onCancel: () => void
  onSave: () => void
}

export function CateringHeader({
  onBack,
  onCancel,
  onSave,
}: CateringHeaderProps) {
  return (
    <article
      className='page-card'
      style={{
        padding: '1.6rem',
        background: 'linear-gradient(180deg, var(--surface) 0%, var(--surface-soft) 100%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type='button'
              onClick={onBack}
              style={{
                fontWeight: 600,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              {'< '}Powrot
            </button>
            <span className='status-pill status-pill-warning'>
              W trakcie
            </span>
          </div>

          <h1 className='page-title' style={{ fontSize: '2rem', marginTop: '1rem' }}>
            Szczegoly Zadania - Catering
          </h1>
          <p className='page-subtitle' style={{ fontSize: '1.05rem' }}>
            Zarzadzaj szczegolami cateringu dla Twojego wydarzenia
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap' }}>
          <button
            type='button'
            onClick={onCancel}
            className='button-secondary'
          >
            Anuluj
          </button>

          <button
            type='button'
            onClick={onSave}
            className='button-primary'
          >
            Zapisz Zmiany
          </button>
        </div>
      </div>
    </article>
  )
}
