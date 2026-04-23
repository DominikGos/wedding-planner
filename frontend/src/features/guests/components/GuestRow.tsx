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
  return (
    <div
      onClick={onSelect}
      style={{
        display: 'grid',
        gridTemplateColumns: '2.1fr 1.3fr 0.55fr 1fr 0.7fr',
        gap: '1rem',
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
      <span>
        <StatusBadge status={guest.status} />
      </span>
      <span>
        <span
          style={{
            width: '2.2rem',
            height: '2.2rem',
            borderRadius: '999px',
            background: '#faf3ee',
            color: '#d6a061',
            display: 'inline-grid',
            placeItems: 'center',
          }}
        >
          {guest.table}
        </span>
      </span>
      <span>{guest.allergy}</span>
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
