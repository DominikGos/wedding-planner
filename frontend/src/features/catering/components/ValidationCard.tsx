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
        borderColor: '#bff0cf',
        background: '#f7fff9',
        padding: '1.35rem',
      }}
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '14px',
            background: '#d9f9e5',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            color: '#0ea44b',
            fontSize: '1.25rem',
            fontWeight: 700,
          }}
          >
          OK
        </div>

        <div>
          <strong style={{ display: 'block', color: '#14834b', fontSize: '1.1rem' }}>
            {title}
          </strong>
          <p style={{ margin: '0.45rem 0 0', color: '#14834b' }}>{text}</p>
        </div>
      </div>
    </article>
  )
}
