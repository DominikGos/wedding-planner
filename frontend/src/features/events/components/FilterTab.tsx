type FilterTabProps = {
  label: string
  active?: boolean
  onClick: () => void
}

export function FilterTab({
  label,
  active = false,
  onClick,
}: FilterTabProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      style={{
        padding: '0.45rem 0.8rem',
        borderRadius: '12px',
        background: active ? '#fde8de' : 'transparent',
        color: active ? '#db7e45' : 'var(--muted)',
        fontWeight: active ? 700 : 500,
        border: 'none',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}
