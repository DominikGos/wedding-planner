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
        background: 'linear-gradient(180deg, #fffdf9 0%, #fff8f1 100%)',
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
            <span
              style={{
                padding: '0.25rem 0.8rem',
                borderRadius: '999px',
                background: '#fff2cc',
                color: '#d37b00',
                fontWeight: 600,
              }}
            >
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
            style={{
              padding: '0.9rem 1.25rem',
              borderRadius: '14px',
              background: '#fffdfa',
              color: 'var(--text)',
              border: '1px solid #efe1d0',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Anuluj
          </button>

          <button
            type='button'
            onClick={onSave}
            style={{
              padding: '0.9rem 1.25rem',
              borderRadius: '14px',
              background: '#d6a061',
              color: '#fff',
              border: '1px solid transparent',
              boxShadow: '0 10px 24px rgba(214, 160, 97, 0.24)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Zapisz Zmiany
          </button>
        </div>
      </div>
    </article>
  )
}
