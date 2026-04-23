import { type Vendor } from '../data/vendorsMock'
import { VendorIcon, type VendorIconName } from './VendorIcon'

type VendorTableProps = {
  vendors: Vendor[]
}

export function VendorTable({ vendors }: VendorTableProps) {
  const getStatusStyle = (status: Vendor['status']) => {
    switch (status) {
      case 'confirmed':
        return { bg: '#eef8f3', text: '#35684f', label: 'Potwierdzony' }
      case 'pending':
        return { bg: '#fff9eb', text: '#8c5a12', label: 'Oczekujący' }
      case 'unavailable':
        return { bg: '#fff2f2', text: '#c53030', label: 'Niedostępny' }
    }
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={headerStyle}>Dostawca</th>
            <th style={headerStyle}>Kategoria</th>
            <th style={headerStyle}>Ocena</th>
            <th style={headerStyle}>Status</th>
            <th style={headerStyle}>Cena od</th>
            <th style={headerStyle}></th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((v) => {
            const status = getStatusStyle(v.status)
            return (
              <tr key={v.id} style={{ borderBottom: '1px solid #f6f3ed' }}>
                <td style={cellStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '50%',
                      background: 'var(--bg-accent)',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0
                    }}>
                      <VendorIcon name={v.icon as VendorIconName} color="var(--primary)" size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{v.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{v.email}</div>
                    </div>
                  </div>
                </td>
                <td style={cellStyle}>{v.category}</td>
                <td style={cellStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <VendorIcon name="star" color="#d9a15f" size={16} />
                    <span style={{ fontWeight: 600 }}>{v.rating}</span>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>({v.reviewsCount})</span>
                  </div>
                </td>
                <td style={cellStyle}>
                  <span
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      background: status.bg,
                      color: status.text,
                    }}
                  >
                    {status.label}
                  </span>
                </td>
                <td style={cellStyle}>
                  <div style={{ fontWeight: 500 }}>{v.priceFrom}</div>
                </td>
                <td style={cellStyle}>
                  <button style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    color: 'var(--muted)',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <VendorIcon name="chevron-right" color="currentColor" size={20} />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const headerStyle: React.CSSProperties = {
  padding: '1.25rem 1rem',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: 'var(--muted)',
}

const cellStyle: React.CSSProperties = {
  padding: '1.25rem 1rem',
  fontSize: '0.95rem',
}
