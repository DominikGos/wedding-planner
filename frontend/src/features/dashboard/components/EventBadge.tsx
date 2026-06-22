type EventBadgeProps = {
  status: string
}

export function EventBadge({ status }: EventBadgeProps) {
  const className = status === 'Wazne' ? 'status-pill status-pill-warning' : 'status-pill'

  return (
    <span className={className}>
      {status}
    </span>
  )
}
