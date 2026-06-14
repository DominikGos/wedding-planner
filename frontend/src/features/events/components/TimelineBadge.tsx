type TimelineBadgeProps = {
  status: string
}

export function TimelineBadge({ status }: TimelineBadgeProps) {
  const styles =
    status === 'Zrobione'
      ? { background: '#daf6e5', color: '#14834b' }
      : status === 'W trakcie'
        ? { background: '#fff3cf', color: '#d37b00' }
        : { background: '#eef4ff', color: '#2f6db5' }

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
