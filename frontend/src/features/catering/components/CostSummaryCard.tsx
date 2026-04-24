type CostSummaryCardProps = {
  costPerPerson: number
  guestsCount: number
  selectedItems: number
  totalCost: number
  fitsBudget: boolean
}

function MoneyIcon() {
  return (
    <svg
      width='22'
      height='22'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      stroke='#d6a061'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M12 3V21' />
      <path d='M16 7.2C16 5.985 14.657 5 13 5H11C9.343 5 8 5.985 8 7.2C8 8.415 9.343 9.4 11 9.4H13C14.657 9.4 16 10.385 16 11.6C16 12.815 14.657 13.8 13 13.8H11C9.343 13.8 8 14.785 8 16C8 17.215 9.343 18.2 11 18.2H13C14.657 18.2 16 17.215 16 16' />
    </svg>
  )
}

export function CostSummaryCard({
  costPerPerson,
  guestsCount,
  selectedItems,
  totalCost,
  fitsBudget,
}: CostSummaryCardProps) {
  return (
    <article className='page-card' style={{ padding: 0, overflow: 'hidden' }}>
      <div
        style={{
          padding: '1.2rem 1.35rem',
          borderBottom: '1px solid #f1e8dc',
          display: 'flex',
          alignItems: 'center',
          gap: '0.9rem',
        }}
      >
        <div
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '14px',
            background: '#faf3ee',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <MoneyIcon />
        </div>
        <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Kosztorys</h2>
      </div>

      <div style={{ padding: '1.35rem', display: 'grid', gap: '1rem' }}>
        <div
          style={{
            padding: '1.2rem',
            borderRadius: '16px',
            background: '#fbf8f3',
          }}
        >
          <p style={{ margin: 0, color: 'var(--muted)' }}>Koszt na osobe</p>
          <strong
            style={{
              display: 'block',
              marginTop: '0.3rem',
              fontSize: '2rem',
              color: '#d6a061',
            }}
          >
            {costPerPerson} PLN
          </strong>
        </div>

        <div style={{ display: 'grid', gap: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
            <span style={{ color: 'var(--muted)' }}>Liczba gosci</span>
            <strong>{guestsCount}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
            <span style={{ color: 'var(--muted)' }}>Wybrane pozycje</span>
            <strong>{selectedItems}</strong>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #f1e8dc', paddingTop: '1rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1rem',
              alignItems: 'center',
            }}
          >
            <strong style={{ fontSize: '1rem' }}>Suma calkowita</strong>
            <strong style={{ fontSize: '1.8rem', color: '#d6a061' }}>
              {totalCost.toLocaleString('pl-PL')} PLN
            </strong>
          </div>
          <p
            style={{
              margin: '0.8rem 0 0',
              color: fitsBudget ? '#0ea44b' : '#d37b00',
              fontWeight: 500,
            }}
          >
            {fitsBudget ? 'Miesci sie w budzecie' : 'Przekracza zalozony budzet'}
          </p>
        </div>
      </div>
    </article>
  )
}
