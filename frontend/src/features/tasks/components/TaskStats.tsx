type TaskStatsProps = {
  title: string
  value: string
  note: string
  color: string
  isActive?: boolean
  onClick?: () => void
}

export function TaskStats({
  title,
  value,
  note,
  color,
  isActive = false,
  onClick,
}: TaskStatsProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      style={{
        border: `1px solid ${isActive ? color : '#efe1d0'}`,
        borderRadius: '16px',
        background: isActive ? '#fff8f1' : '#fffdfa',
        padding: '1rem 1rem 0.95rem',
        display: 'grid',
        gap: '0.45rem',
        textAlign: 'left',
        cursor: 'pointer',
        minHeight: '126px',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontWeight: 600 }}>
        <span
          style={{
            width: '0.8rem',
            height: '0.8rem',
            borderRadius: '999px',
            background: color,
            boxShadow: `0 0 0 4px ${color}20`,
            display: 'inline-block',
          }}
        />
        {title}
      </span>
      <strong style={{ fontSize: '2rem', color: '#1f1a14' }}>{value}</strong>
      <span style={{ color: 'var(--muted)' }}>{note}</span>
    </button>
  )
}
