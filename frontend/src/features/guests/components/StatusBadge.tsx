import type { GuestStatus } from '../data/guestsMock'

function getStatusClass(status: GuestStatus) {
  if (status === 'Potwierdzony') return 'status-pill status-pill-success'
  if (status === 'Odrzucony') return 'status-pill status-pill-danger'
  return 'status-pill status-pill-warning'
}

type StatusBadgeProps = {
  status: GuestStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={getStatusClass(status)}>
      {status}
    </span>
  )
}
