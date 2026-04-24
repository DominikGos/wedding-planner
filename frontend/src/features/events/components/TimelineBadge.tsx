type TimelineBadgeProps = {
  status: string
}

export function TimelineBadge({ status }: TimelineBadgeProps) {
  const styles =
    status === 'Oplacone'
      ? { background: '#daf6e5', color: '#14834b' }
      : status === 'W trakcie'
        ? { background: '#fff3cf', color: '#d37b00' }
        : status === 'Nadchodzace'
          ? { background: '#ffe3ea', color: '#ff4f73' }
          : { background: '#f8dff0', color: '#8b3b74' }

  return (
    <span
      style={{
        padding: '0.35rem 0.8rem',
        borderRadius: '999px',
        background: styles.background,
        color: styles.color,
        fontWeight: 600,
        fontSize: '0.9rem',
      }}
    >
      {status}
    </span>
  )
}
