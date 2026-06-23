import type { GuestStatus } from '../data/guestsMock'
import { useTranslation } from 'react-i18next'

function getStatusClass(status: GuestStatus) {
  if (status === 'Potwierdzony') return 'status-pill status-pill-success'
  if (status === 'Odrzucony') return 'status-pill status-pill-danger'
  return 'status-pill status-pill-warning'
}

type StatusBadgeProps = {
  status: GuestStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation()
  const label = status === 'Potwierdzony'
    ? t('guests.statusConfirmed')
    : status === 'Odrzucony'
      ? t('guests.statusRejected')
      : t('guests.statusWaiting')

  return (
    <span className={getStatusClass(status)}>
      {label}
    </span>
  )
}
