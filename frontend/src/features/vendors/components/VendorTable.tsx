import { type Vendor } from '../data/vendorsMock'
import { VendorIcon, type VendorIconName } from './VendorIcon'
import { useTranslation } from 'react-i18next'

type VendorTableProps = {
  vendors: Vendor[]
  onSelectVendor: (vendor: Vendor) => void
  selectedVendorId: string | null
  getCategoryLabel: (category: string) => string
}

export function VendorTable({ vendors, onSelectVendor, selectedVendorId, getCategoryLabel }: VendorTableProps) {
  const { t } = useTranslation()

  const getStatusStyle = (status: Vendor['status']) => {
    switch (status) {
      case 'confirmed':
        return { className: 'status-pill status-pill-success', label: t('vendors.statusConfirmed') }
      case 'pending':
        return { className: 'status-pill status-pill-warning', label: t('vendors.statusPending') }
      case 'unavailable':
        return { className: 'status-pill status-pill-danger', label: t('vendors.statusUnavailable') }
    }
  }

  return (
    <div className='data-table-wrapper'>
      <table className='data-table'>
        <thead>
          <tr>
            <th style={headerStyle}>{t('vendors.colVendor')}</th>
            <th style={headerStyle}>{t('vendors.colCategory')}</th>
            <th style={headerStyle}>{t('vendors.colRating')}</th>
            <th style={headerStyle}>{t('vendors.colStatus')}</th>
            <th style={headerStyle}>{t('vendors.colPriceFrom')}</th>
            <th style={headerStyle}></th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((v) => {
            const status = getStatusStyle(v.status)
            const isSelected = selectedVendorId === v.id
            
            return (
              <tr 
                key={v.id} 
                onClick={() => onSelectVendor(v)}
                style={{ 
                  background: isSelected ? 'var(--primary-soft)' : 'var(--surface)',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
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
                <td style={cellStyle}>{getCategoryLabel(v.category)}</td>
                <td style={cellStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <VendorIcon name="star" color="#d9a15f" size={16} />
                    <span style={{ fontWeight: 600 }}>{v.rating}</span>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>({v.reviewsCount})</span>
                  </div>
                </td>
                <td style={cellStyle}>
                  <span className={status.className}>
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
                    color: isSelected ? 'var(--primary)' : 'var(--muted)',
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
  fontSize: '0.85rem',
  fontWeight: 600,
  color: 'var(--muted)',
}

const cellStyle: React.CSSProperties = {
  fontSize: '0.95rem',
}
