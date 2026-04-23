import { BudgetIcon, type BudgetIconName } from './BudgetIcon'

type BudgetStatCardProps = {
  title: string
  value: string
  color: string
  icon: BudgetIconName
}

export function BudgetStatCard({ title, value, color, icon }: BudgetStatCardProps) {
  return (
    <article className='stat-item' style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1rem', 
      padding: '1.25rem',
      background: '#fff'
    }}>
      <div style={{
        width: '3rem',
        height: '3rem',
        borderRadius: '12px',
        background: `${color}15`,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0
      }}>
        <BudgetIcon name={icon} color={color} size={22} strokeWidth={2.2} />
      </div>
      <div>
        <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{title}</span>
        <strong style={{ display: 'block', color: '#2f2a24', fontSize: '1.4rem', marginTop: '0.2rem' }}>
          {value}
        </strong>
      </div>
    </article>
  )
}
