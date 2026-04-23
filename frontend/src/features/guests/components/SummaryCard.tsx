type SummaryCardProps = {
  title: string
  value: string
  color: string
  border: string
  isSelected: boolean
  onClick: () => void
}

export function SummaryCard({
  title,
  value,
  color,
  border,
  isSelected,
  onClick,
}: SummaryCardProps) {
  return (
    <button
      type='button'
      className='stat-item'
      onClick={onClick}
      style={{
        padding: '1.15rem 1.3rem',
        borderColor: isSelected ? color : border,
        boxShadow: '0 8px 22px rgba(47, 42, 36, 0.05)',
        background: isSelected ? '#fff9f3' : '#fff',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span style={{ color }}>{title}</span>
      <strong style={{ color, fontSize: '1.45rem', marginTop: '0.55rem' }}>{value}</strong>
    </button>
  )
}
