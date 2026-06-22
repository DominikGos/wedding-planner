type BudgetLegendItemProps = {
  name: string
  amount: string
  color: string
}

export function BudgetLegendItem({
  name,
  amount,
  color,
}: BudgetLegendItemProps) {
  return (
    <div
      className='budget-legend-item'
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '1rem',
        alignItems: 'center',
        borderRadius: '12px',
        padding: '0.5rem 0.6rem',
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
