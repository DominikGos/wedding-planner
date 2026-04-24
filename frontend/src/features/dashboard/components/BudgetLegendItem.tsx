type BudgetLegendItemProps = {
  name: string
  amount: string
  color: string
  isHovered: boolean
  onHoverStart: () => void
  onHoverEnd: () => void
}

export function BudgetLegendItem({
  name,
  amount,
  color,
  isHovered,
  onHoverStart,
  onHoverEnd,
}: BudgetLegendItemProps) {
  return (
    <div
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '1rem',
        alignItems: 'center',
        border: `1px solid ${isHovered ? color : 'transparent'}`,
        borderRadius: '12px',
        background: isHovered ? '#fff8f1' : 'transparent',
        padding: '0.5rem 0.6rem',
        transition: 'border-color 0.2s ease, background 0.2s ease',
      }}
    >
      <span style={{ display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
        <span
          style={{
            width: '0.95rem',
            height: '0.95rem',
            borderRadius: '999px',
            background: color,
            display: 'inline-block',
          }}
        />
        <span>{name}</span>
      </span>
      <span>{amount}</span>
    </div>
  )
}
