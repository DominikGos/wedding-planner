import type { Guest } from '../data/guestsMock'
import { useTranslation } from 'react-i18next'
import { StatusBadge } from './StatusBadge'

type GuestRowProps = {
  guest: Guest
  onEdit: () => void
}

export function GuestRow({
  guest,
  onEdit,
}: GuestRowProps) {
  const { t } = useTranslation()
  const isDeclined = guest.status === 'Odrzucony'

  return (
    <div
      className='data-table-row'
      style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr 1.5fr 0.8fr 1fr 1.2fr 1fr 0.6fr',
        gap: '1rem',
        minWidth: '1120px',
        padding: '0.95rem 0.9rem',
        alignItems: 'center',
        borderLeft: '3px solid transparent',
        textAlign: 'left',
      }}
    >
      <span style={{ fontSize: '0.98rem' }}>{guest.name}</span>
      <span style={{ color: 'var(--muted)', overflowWrap: 'anywhere' }}>{guest.email || '—'}</span>
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span
          style={{
            minWidth: '72px',
            minHeight: '2.2rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '999px',
            background: 'var(--surface-soft)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            whiteSpace: 'nowrap',
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          {guest.table || '—'}
        </span>
      </span>
      <span>{isDeclined ? '—' : guest.allergy || '—'}</span>
      <span>{isDeclined ? guest.declineReason || '—' : '—'}</span>
      <span>
        <StatusBadge status={guest.status} />
      </span>
      <span style={{ textAlign: 'right' }}>
        <button
          type='button'
          onClick={(event) => {
            event.stopPropagation()
            onEdit()
          }}
          className='table-action-link'
        >
          {t('common.edit')}
        </button>
      </span>
    </div>
  )
}
