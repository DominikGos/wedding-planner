import type { GuestStatus } from '../data/guestsMock'

function getStatusStyles(status: GuestStatus) {
  if (status === 'Potwierdzony') {
    return {
      color: '#14834b',
      background: '#d9f9e5',
      border: '#bff0cf',
    }
  }

  if (status === 'Odrzucony') {
    return {
      color: '#d92929',
      background: '#ffe0e0',
      border: '#ffc7c7',
    }
  }

  return {
    color: '#d37b00',
    background: '#fff1c9',
    border: '#f5d57d',
  }
}

type StatusBadgeProps = {
  status: GuestStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusStyles = getStatusStyles(status)

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.28rem 0.75rem',
        borderRadius: '999px',
        border: `1px solid ${statusStyles.border}`,
        background: statusStyles.background,
        color: statusStyles.color,
        fontWeight: 600,
      }}
    >
      {status}
    </span>
  )
}
