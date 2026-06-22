type ValidationCardProps = {
  title: string
  text: string
}

export function ValidationCard({
  title,
  text,
}: ValidationCardProps) {
  return (
    <article
      className='page-card'
      style={{
        borderColor: 'var(--ok)',
        background: 'color-mix(in srgb, var(--ok) 10%, var(--surface))',
        padding: '1.35rem',
      }}
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '14px',
            background: 'color-mix(in srgb, var(--ok) 16%, var(--surface))',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            color: 'var(--ok)',
            fontSize: '1.25rem',
            fontWeight: 700,
          }}
          >
          OK
        </div>

        <div>
          <strong style={{ display: 'block', color: 'var(--ok)', fontSize: '1.1rem' }}>
            {title}
          </strong>
          <p style={{ margin: '0.45rem 0 0', color: 'var(--ok)' }}>{text}</p>
        </div>
      </div>
    </article>
  )
}
