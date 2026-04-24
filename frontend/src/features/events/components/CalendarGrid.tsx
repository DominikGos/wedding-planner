type CalendarGridProps = {
  calendarRows: string[][]
  activeDate: string
  onSelectDate: (day: string) => void
}

export function CalendarGrid({
  calendarRows,
  activeDate,
  onSelectDate,
}: CalendarGridProps) {
  return (
    <div style={{ marginTop: '0.8rem', display: 'grid', gap: '0.6rem' }}>
      {calendarRows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.6rem',
            textAlign: 'center',
          }}
        >
          {row.map((day) => {
            const isActive = day === activeDate
            const isMuted = rowIndex === 0 || rowIndex === 5 ? '#8e867b' : 'var(--text)'

            return (
              <button
                key={`${rowIndex}-${day}`}
                type='button'
                onClick={() => onSelectDate(day)}
                style={{
                  width: '2rem',
                  height: '2rem',
                  margin: '0 auto',
                  borderRadius: '999px',
                  display: 'grid',
                  placeItems: 'center',
                  background: isActive ? '#d78d5e' : 'transparent',
                  color: isActive ? '#fff' : isMuted,
                  fontWeight: isActive ? 700 : 500,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {day}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
