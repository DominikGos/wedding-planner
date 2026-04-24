import type { CateringMenuSectionData } from '../data/cateringMock'

function MenuIcon() {
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
      <path d='M6 4V20' />
      <path d='M10 4V11' />
      <path d='M6 8H10' />
      <path d='M14 4V20' />
      <path d='M18 4C19.657 4 21 5.343 21 7V20' />
    </svg>
  )
}

type MenuSectionProps = {
  sections: CateringMenuSectionData[]
  selectedItemId: string
  onToggleItem: (sectionId: string, itemId: string) => void
}

export function MenuSection({
  sections,
  selectedItemId,
  onToggleItem,
}: MenuSectionProps) {
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
          <MenuIcon />
        </div>
        <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Menu</h2>
      </div>

      <div style={{ padding: '1.35rem', display: 'grid', gap: '1.4rem' }}>
        {sections.map((section) => (
          <div key={section.id}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem' }}>{section.title}</h3>
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              {section.items.map((item) => (
                <button
                  key={item.id}
                  type='button'
                  onClick={() => onToggleItem(section.id, item.id)}
                  style={{
                    border: `1px solid ${selectedItemId === item.id ? '#d6a061' : '#f0dfcf'}`,
                    borderRadius: '16px',
                    padding: '1rem 1.2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    alignItems: 'center',
                    background: selectedItemId === item.id ? '#fff8f1' : '#fffdfa',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span
                      style={{
                        width: '1.8rem',
                        height: '1.8rem',
                        borderRadius: '8px',
                        border: item.checked ? '1px solid #d6a061' : '1px solid #efe1d0',
                        background: item.checked ? '#d6a061' : '#fffdfa',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#fff',
                        flexShrink: 0,
                        fontSize: '0.95rem',
                        fontWeight: 700,
                      }}
                    >
                      {item.checked ? 'x' : ''}
                    </span>
                    <strong style={{ fontSize: '1rem', fontWeight: 600 }}>{item.name}</strong>
                  </span>

                  <span style={{ color: '#d6a061', fontWeight: 700, fontSize: '1rem' }}>
                    {item.price} PLN
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}
