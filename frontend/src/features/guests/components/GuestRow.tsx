import type { Guest } from '../data/guestsMock'
import { StatusBadge } from './StatusBadge'

type GuestRowProps = {
  guest: Guest
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
}

export function GuestRow({
  guest,
  isSelected,
  onSelect,
  onEdit,
}: GuestRowProps) {
  const isDeclined = guest.status === 'Odrzucony'

  return (
    <div
      onClick={onSelect}
      style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr 1.5fr 0.8fr 1fr 1.2fr 1fr 0.6fr',
        gap: '1rem',
        minWidth: '1120px',
        padding: '0.95rem 0.9rem',
        borderTop: '1px solid #f4eadf',
        alignItems: 'center',
        borderLeft: isSelected ? '3px solid #d6a061' : '3px solid transparent',
        background: isSelected ? '#fff8f1' : '#fffdfa',
        cursor: 'pointer',
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
            background: '#faf3ee',
            color: '#d6a061',
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
          style={{
            color: '#d6a061',
            fontWeight: 500,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Edytuj
        </button>
      </span>
    </div>
  )
}
