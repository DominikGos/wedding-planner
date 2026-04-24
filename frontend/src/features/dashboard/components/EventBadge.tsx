type EventBadgeProps = {
  status: string
}

export function EventBadge({ status }: EventBadgeProps) {
  return (
    <span
      style={{
        padding: '0.35rem 0.8rem',
        borderRadius: '999px',
        background: status === 'Wazne' ? '#d6a061' : '#f8dff0',
        color: status === 'Wazne' ? '#fff' : '#6b4362',
        fontWeight: 600,
      }}
    >
      {status}
    </span>
  )
}
