import { useState, useEffect } from 'react'
import { type VendorCategory, type Vendor } from '../data/vendorsMock'
import { VendorIcon, type VendorIconName } from './VendorIcon'
import { useTranslation } from 'react-i18next'

type VendorSidebarProps = {
  categories: VendorCategory[]
  budgetLimit: number
  plannedExpenses: number
  onBudgetLimitChange: (value: number) => void
  selectedVendor: Vendor | null
  onStatusChange: (status: Vendor['status']) => void
  onDelete: () => void
  onClose: () => void
  userRole?: string
  getCategoryLabel: (category: string) => string
}

export function VendorSidebar({ 
  categories, 
  budgetLimit, 
  plannedExpenses,
  onBudgetLimitChange,
  selectedVendor,
  onStatusChange,
  onDelete,
  onClose,
  userRole = 'couple',
  getCategoryLabel
}: VendorSidebarProps) {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(budgetLimit.toString())
  
  useEffect(() => {
    queueMicrotask(() => setInputValue(budgetLimit.toString()))
  }, [budgetLimit])

  const percentage = Math.round((plannedExpenses / budgetLimit) * 100)
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
      
      {/* SELECTED VENDOR DETAILS PANEL */}
      {selectedVendor && (
        <section className='page-card' style={{ 
          padding: '1.25rem',
          background: 'var(--surface)',
          borderColor: 'var(--primary)',
          boxShadow: '0 4px 20px rgba(184, 90, 31, 0.08)',
          position: 'relative',
          animation: 'fadeIn 0.25s ease'
        }}>
          {/* Close button */}
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              border: 'none',
              background: 'none',
              fontSize: '1rem',
              color: 'var(--muted)',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ✕
          </button>

          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', fontWeight: 600 }}>
            {t('vendorSidebar.detailsTitle')}
          </span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: '2.8rem',
              height: '2.8rem',
              borderRadius: '50%',
              background: 'var(--primary-soft)',
              display: 'grid',
              placeItems: 'center'
            }}>
              <VendorIcon name={selectedVendor.icon as VendorIconName} color="var(--primary)" size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text)', fontWeight: 600 }}>
                {selectedVendor.name}
              </h4>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                ✉️ {selectedVendor.email}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>{t('vendorSidebar.categoryLabel')}</span>
              <strong style={{ color: 'var(--text)' }}>{getCategoryLabel(selectedVendor.category)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>{t('vendorSidebar.priceLabel')}</span>
              <strong style={{ color: 'var(--primary)' }}>{selectedVendor.priceFrom}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--muted)' }}>{t('vendorSidebar.ratingLabel')}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                ⭐ {selectedVendor.rating} <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '0.8rem' }}>({t('vendorSidebar.reviews', { count: selectedVendor.reviewsCount })})</span>
              </span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'grid', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>{t('vendorSidebar.collaborationStatus')}</label>
            <select 
              value={selectedVendor.status}
              onChange={(e) => onStatusChange(e.target.value as Vendor['status'])}
              disabled={userRole === 'couple'}
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '0.9rem',
                fontWeight: 600,
                background: userRole === 'couple' ? 'var(--surface-soft)' : 'var(--surface)',
                color: 'var(--text)',
                cursor: userRole === 'couple' ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="confirmed">{t('vendorSidebar.statusConfirmed')}</option>
              <option value="pending">{t('vendorSidebar.statusPending')}</option>
              <option value="unavailable">{t('vendorSidebar.statusUnavailable')}</option>
            </select>
          </div>

          <button
            type='button'
            onClick={onDelete}
            style={{
              width: '100%',
              marginTop: '1rem',
              padding: '0.7rem 1rem',
              borderRadius: '10px',
              border: '1px solid var(--danger)',
              background: 'var(--danger-soft)',
              color: 'var(--danger)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {t('vendorSidebar.deleteBtn')}
          </button>
        </section>
      )}

      {/* POPULAR CATEGORIES */}
      <section className='page-card' style={{ padding: '1.25rem' }}>
        <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700 }}>{t('vendorSidebar.popularCategories')}</h3>
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
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{getCategoryLabel(cat.name)}</span>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>{cat.count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PLANNED EXPENSES */}
      <section className='page-card' style={{ padding: '1.25rem' }}>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 700 }}>{t('vendorSidebar.plannedExpenses')}</h3>
        <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: 'var(--muted)' }}>{t('vendorSidebar.estimatedSum')}</p>
        
        <div style={{ marginBottom: '1.25rem' }}>
          <strong style={{ fontSize: '1.6rem', color: 'var(--text)' }}>
            {plannedExpenses.toLocaleString('pl-PL')} PLN
          </strong>
        </div>

        <div style={{ 
          height: '10px', 
          background: 'var(--border)',
          borderRadius: '999px', 
          overflow: 'hidden',
          marginBottom: '0.75rem'
        }}>
          <div style={{ 
            height: '100%', 
            width: `${displayPercentage}%`, 
            background: percentage > 100 ? 'var(--danger)' : 'var(--primary)',
            borderRadius: '999px',
            transition: 'width 0.3s ease'
          }} />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <span style={{ color: percentage > 100 ? 'var(--danger)' : 'var(--muted)', fontWeight: percentage > 100 ? 600 : 400 }}>
            {t('vendorSidebar.budgetPercent', { pct: percentage })}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
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
              <span style={{ color: 'var(--muted)' }}>{t('vendorSidebar.budgetLimit', { amount: budgetLimit.toLocaleString() })}</span>
              {userRole === 'planner' && (
                <button 
                  onClick={() => setIsEditing(true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </button>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
