import { useState } from 'react'
import { type VendorCategory, vendorStats } from '../data/vendorsMock'
import { VendorIcon, type VendorIconName } from './VendorIcon'

type VendorSidebarProps = {
  categories: VendorCategory[]
  budgetLimit: number
  onBudgetLimitChange: (value: number) => void
}

export function VendorSidebar({ categories, budgetLimit, onBudgetLimitChange }: VendorSidebarProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(budgetLimit.toString())
  
  const percentage = Math.round((vendorStats.plannedExpenses / budgetLimit) * 100)
  const displayPercentage = Math.min(100, percentage)

  const handleSave = () => {
    const val = parseInt(inputValue)
    if (!isNaN(val) && val > 0) {
      onBudgetLimitChange(val)
    } else {
      setInputValue(budgetLimit.toString())
    }
    setIsEditing(false)
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <section className='page-card' style={{ padding: '1.25rem' }}>
        <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700 }}>Popularne kategorie</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {categories.map((cat) => (
            <div key={cat.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '2.2rem',
                  height: '2.2rem',
                  borderRadius: '10px',
                  background: 'var(--bg-accent)',
                  display: 'grid',
                  placeItems: 'center'
                }}>
                  <VendorIcon name={cat.icon as VendorIconName} color="var(--primary)" size={18} />
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{cat.name}</span>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>{cat.count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className='page-card' style={{ padding: '1.25rem' }}>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 700 }}>Planowane wydatki</h3>
        <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: 'var(--muted)' }}>Suma szacunkowa</p>
        
        <div style={{ marginBottom: '1.25rem' }}>
          <strong style={{ fontSize: '1.6rem', color: 'var(--text)' }}>
            {vendorStats.plannedExpenses.toLocaleString()} PLN
          </strong>
        </div>

        <div style={{ 
          height: '10px', 
          background: '#f1e8dc', 
          borderRadius: '999px', 
          overflow: 'hidden',
          marginBottom: '0.75rem'
        }}>
          <div style={{ 
            height: '100%', 
            width: `${displayPercentage}%`, 
            background: percentage > 100 ? '#c53030' : 'var(--primary)',
            borderRadius: '999px',
            transition: 'width 0.3s ease'
          }} />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <span style={{ color: percentage > 100 ? '#c53030' : 'var(--muted)', fontWeight: percentage > 100 ? 600 : 400 }}>
            {percentage}% z budżetu na dostawców
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', paddingTop: '1rem', borderTop: '1px solid #f1e8dc' }}>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', width: '100%' }}>
              <input 
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                autoFocus
                onBlur={handleSave}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                style={{
                  width: '100%',
                  padding: '0.3rem 0.5rem',
                  borderRadius: '6px',
                  border: '1px solid var(--primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          ) : (
            <>
              <span style={{ color: 'var(--muted)' }}>Limit budżetu: {budgetLimit.toLocaleString()} PLN</span>
              <button 
                onClick={() => setIsEditing(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
