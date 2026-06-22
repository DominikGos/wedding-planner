type ToolbarButtonProps = {
  label: string
  onClick: () => void
}

export function ToolbarButton({ label, onClick }: ToolbarButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      style={{
        padding: '0.65rem 1rem',
        borderRadius: '14px',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        color: 'var(--text)',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}
