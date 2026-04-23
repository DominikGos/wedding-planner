import { VendorIcon, type VendorIconName } from './VendorIcon'

type VendorStatCardProps = {
  title: string
  value: number
  note: string
  color: string
  icon: VendorIconName
}

export function VendorStatCard({ title, value, note, color, icon }: VendorStatCardProps) {
  return (
    <article className='stat-item' style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1rem', 
      padding: '1.25rem',
      background: '#fff'
    }}>
      <div style={{
        width: '3.5rem',
        height: '3.5rem',
        borderRadius: '14px',
        background: `${color}08`,
        border: `1px solid ${color}20`,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0
      }}>
        <VendorIcon name={icon} color={color} size={28} strokeWidth={1.5} />
      </div>
      <div>
        <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{title}</span>
        <strong style={{ display: 'block', color: '#2f2a24', fontSize: '1.6rem', lineHeight: '1.2', margin: '0.1rem 0' }}>
          {value}
        </strong>
        <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{note}</span>
      </div>
    </article>
  )
}
