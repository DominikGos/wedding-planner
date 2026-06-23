import { useEffect, useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { createVendor, deleteVendor, getVendors, type VendorResponse } from '../../../api/vendorApi'
import type { RootState } from '../../../store'
import { addVendor, removeVendor, setVendors, updateVendorStatus } from '../../../store/slices/vendorsSlice'

import { VendorStatCard } from '../components/VendorStatCard'
import { VendorTable } from '../components/VendorTable'
import { VendorSidebar } from '../components/VendorSidebar'
import { VendorIcon } from '../components/VendorIcon'
import { vendorCategories, type Vendor, type VendorCategory } from '../data/vendorsMock'

const iconMap: Record<string, string> = {
  Catering: 'catering',
  Florystyka: 'flowers',
  Fotografia: 'camera',
  'Sala weselna': 'venue',
  Muzyka: 'music',
}

function normalizeServiceType(serviceType: string | null | undefined) {
  if (!serviceType) return 'Inne'

  const normalized = serviceType.toUpperCase()
  if (normalized === 'CATERING') return 'Catering'
  if (normalized === 'DECORATION' || normalized === 'DEKORACJE' || normalized === 'FLORYSTYKA') return 'Florystyka'
  if (normalized === 'PHOTOGRAPHY' || normalized === 'FOTOGRAFIA') return 'Fotografia'
  if (normalized === 'VENUE' || normalized === 'SALA WESELNA') return 'Sala weselna'
  if (normalized === 'MUSIC' || normalized === 'MUZYKA' || normalized === 'ENTERTAINMENT') return 'Muzyka'
  return serviceType
}

function getVendorCategoryLabel(category: string, t: (key: string) => string) {
  const labels: Record<string, string> = {
    Catering: t('vendors.categories.catering'),
    Florystyka: t('vendors.categories.florist'),
    Fotografia: t('vendors.categories.photography'),
    'Sala weselna': t('vendors.categories.venue'),
    Muzyka: t('vendors.categories.music'),
    Dekoracje: t('vendors.categories.decorations'),
    Transport: t('vendors.categories.transport'),
    Inne: t('vendors.categories.other'),
  }
  return labels[category] ?? category
}

function getPriceValue(price: VendorResponse['price']) {
  if (typeof price === 'number') return price
  if (typeof price === 'string') return Number(price) || 0
  return 0
}

function formatVendorPrice(price: number, category: string, t: (key: string, options?: Record<string, string>) => string) {
  const formatted = price.toLocaleString('pl-PL')
  return category === 'Catering' ? t('vendors.pricePerPerson', { amount: formatted }) : `${formatted} PLN`
}

function toVendor(response: VendorResponse, t: (key: string, options?: Record<string, string>) => string): Vendor {
  const category = normalizeServiceType(response.serviceType)
  const price = getPriceValue(response.price)

  return {
    id: String(response.id),
    name: response.companyName || t('vendors.unnamedVendor'),
    email: response.contact || '',
    category,
    rating: 0,
    reviewsCount: 0,
    status: 'pending',
    priceFrom: price > 0 ? formatVendorPrice(price, category, t) : t('vendors.noPrice'),
    icon: iconMap[category] || 'users',
  }
}

function getVendorPrice(vendor: Vendor) {
  const normalized = vendor.priceFrom.replace(/\s/g, '').replace(',', '.')
  const match = normalized.match(/\d+(\.\d+)?/)
  return match ? Number(match[0]) : 0
}

export function VendorsPage() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const vendors = useSelector((state: RootState) => state.vendors.items)

  const { user, token } = useSelector((state: RootState) => state.auth)
  const userRole = user?.role || 'couple'

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [budgetLimit, setBudgetLimit] = useState(30000)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [vendorsNotification, setVendorsNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setVendorsNotification({ text, type })
    setTimeout(() => {
      setVendorsNotification(null)
    }, 4000)
  }
  
  // Selection and Modal State
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newVendor, setNewVendor] = useState({
    companyName: '',
    serviceType: 'Catering',
    contact: '',
    price: ''
  })

  // Selected Vendor mapping
  const selectedVendor = useMemo(() => {
    return vendors.find((v: Vendor) => v.id === selectedVendorId) || null
  }, [selectedVendorId, vendors])

  const stats = useMemo(() => {
    const total = vendors.length
    const confirmed = vendors.filter((v: Vendor) => v.status === 'confirmed').length
    const pending = vendors.filter((v: Vendor) => v.status === 'pending').length
    const unavailable = vendors.filter((v: Vendor) => v.status === 'unavailable').length
    return { total, confirmed, pending, unavailable }
  }, [vendors])

  const categories = useMemo<VendorCategory[]>(() => {
    const counts = vendors.reduce<Record<string, number>>((acc, vendor) => {
      acc[vendor.category] = (acc[vendor.category] ?? 0) + 1
      return acc
    }, {})

    const known = vendorCategories.map(category => ({
      ...category,
      count: counts[category.name] ?? 0,
    }))

    const extra = Object.entries(counts)
      .filter(([name]) => !vendorCategories.some(category => category.name === name))
      .map(([name, count]) => ({
        name,
        count,
        icon: iconMap[name] || 'users',
      }))

    return [...known, ...extra].filter(category => category.count > 0)
  }, [vendors])

  const plannedExpenses = useMemo(() => {
    return vendors.reduce((sum, vendor) => sum + getVendorPrice(vendor), 0)
  }, [vendors])

  const filteredVendors = useMemo(() => {
    return vendors.filter((v: Vendor) => {
      const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) || 
                           v.email.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === 'All' || v.category === categoryFilter
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [vendors, search, categoryFilter, statusFilter])

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVendor.companyName.trim() || !newVendor.contact.trim() || !newVendor.price.trim()) {
      showNotification(t('vendors.allFilled'), 'error')
      return
    }

    const price = Number(newVendor.price)
    if (!Number.isFinite(price) || price < 0) {
      showNotification(t('vendors.invalidPrice'), 'error')
      return
    }

    try {
      const created = toVendor(await createVendor({
        companyName: newVendor.companyName.trim(),
        serviceType: newVendor.serviceType,
        contact: newVendor.contact.trim(),
        price,
      }, { token: token ?? undefined }), t)

      dispatch(addVendor(created))
      showNotification(t('vendors.addedSuccess', { name: created.name }), 'success')
      
      setShowAddModal(false)
      setNewVendor({
        companyName: '',
        serviceType: 'Catering',
        contact: '',
        price: ''
      })
    } catch {
      showNotification(t('vendors.addError'), 'error')
    }
  }

  const handleDeleteVendor = async () => {
    if (!selectedVendor) return

    const vendorId = Number(selectedVendor.id)
    if (!Number.isFinite(vendorId)) {
      showNotification(t('vendors.invalidId'), 'error')
      return
    }

    if (!window.confirm(t('vendors.deleteConfirm', { name: selectedVendor.name }))) return

    try {
      await deleteVendor(vendorId, { token: token ?? undefined })
      dispatch(removeVendor(selectedVendor.id))
      setSelectedVendorId(null)
      showNotification(t('vendors.deletedSuccess', { name: selectedVendor.name }), 'success')
    } catch {
      showNotification(t('vendors.deleteError'), 'error')
    }
  }

  useEffect(() => {
    let cancelled = false

    queueMicrotask(() => {
      if (cancelled) return

      setLoading(true)
      setError(null)

      getVendors({ token: token ?? undefined })
        .then((items) => {
          if (cancelled) return
          dispatch(setVendors(items.map(item => toVendor(item, t))))
        })
        .catch(() => {
          if (!cancelled) setError(t('vendors.loadError'))
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    })

    return () => {
      cancelled = true
    }
  }, [dispatch, token, t])

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {vendorsNotification && (
        <div style={{
          padding: '1rem',
          borderRadius: '12px',
          background: vendorsNotification.type === 'success' ? 'color-mix(in srgb, var(--ok) 14%, var(--surface))' : 'var(--danger-soft)',
          color: vendorsNotification.type === 'success' ? 'var(--ok)' : 'var(--danger)',
          border: `1px solid ${vendorsNotification.type === 'success' ? 'var(--ok)' : 'var(--danger)'}`,
          fontWeight: 600,
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease'
        }}>
          {vendorsNotification.text}
        </div>
      )}
      {loading && (
        <div className='app-alert app-alert-info' style={{ textAlign: 'center' }}>
          {t('vendors.loadingVendors')}
        </div>
      )}
      {error && (
        <div className='app-alert app-alert-danger' style={{ textAlign: 'center' }}>
          {error}
        </div>
      )}
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className='page-title'>{t('vendors.pageTitle')}</h1>
          <p className='page-subtitle'>{t('vendors.pageSubtitle')}</p>
        </div>
        {userRole === 'planner' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <button 
              onClick={() => setShowAddModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.1rem',
                background: 'var(--primary)',
                color: 'var(--on-primary)',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(184, 90, 31, 0.2)'
              }}
            >
              <VendorIcon name='plus' color='var(--on-primary)' size={18} strokeWidth={2.5} />
              {t('vendors.addVendor')}
            </button>
          </div>
        )}
      </header>

      {/* STATS */}
      <div className='stats-grid'>
        <VendorStatCard 
          title={t('vendors.statAll')} 
          value={stats.total} 
          note={t('vendors.statAllNote')}
          color="#b85a1f" 
          icon="users" 
        />
        <VendorStatCard 
          title={t('vendors.statConfirmed')} 
          value={stats.confirmed} 
          note={t('vendors.statConfirmedNote')}
          color="#35684f" 
          icon="check" 
        />
        <VendorStatCard 
          title={t('vendors.statPending')} 
          value={stats.pending} 
          note={t('vendors.statPendingNote')}
          color="#8c5a12" 
          icon="clock" 
        />
        <VendorStatCard 
          title={t('vendors.statUnavailable')} 
          value={stats.unavailable} 
          note={t('vendors.statUnavailableNote')}
          color="#c53030" 
          icon="x-circle" 
        />
      </div>

      {/* MAIN TWO-COLUMN CONTAINER */}
      <div className="vendors-layout" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2.5fr) minmax(300px, 1fr)',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        
        {/* Table & Filter list */}
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div className="vendors-filters" style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr 1fr',
            gap: '0.75rem',
            alignItems: 'center' 
          }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder={t('vendors.searchPlaceholder')} 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem 0.7rem 2.5rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  fontSize: '0.9rem',
                  background: 'var(--surface)',
                  color: 'var(--text)'
                }}
              />
              <div style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
            </div>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: '0.7rem 1rem',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                fontSize: '0.9rem',
                background: 'var(--surface)',
                color: 'var(--text)'
              }}
            >
              <option value="All">{t('vendors.categoryAll')}</option>
              {categories.map(c => <option key={c.name} value={c.name}>{getVendorCategoryLabel(c.name, t)}</option>)}
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.7rem 1rem',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                fontSize: '0.9rem',
                background: 'var(--surface)',
                color: 'var(--text)'
              }}
            >
              <option value="All">{t('vendors.statusAll')}</option>
              <option value="confirmed">{t('vendors.statusConfirmed')}</option>
              <option value="pending">{t('vendors.statusPending')}</option>
              <option value="unavailable">{t('vendors.statusUnavailable')}</option>
            </select>
          </div>

          <section className='page-card' style={{ padding: 0, overflow: 'hidden' }}>
            <VendorTable 
              vendors={filteredVendors} 
              onSelectVendor={(v) => setSelectedVendorId(v.id)} 
              selectedVendorId={selectedVendorId}
              getCategoryLabel={(category) => getVendorCategoryLabel(category, t)}
            />
            {!loading && filteredVendors.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
                {t('vendors.noVendors')}
              </div>
            )}
            
            <div style={{ 
              padding: '1.25rem', 
              borderTop: '1px solid var(--border)',
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                {t('vendors.showing', { count: filteredVendors.length, total: stats.total })}
              </span>
            </div>
          </section>
        </div>

        {/* Sidebar details panel */}
        <VendorSidebar 
          categories={categories} 
          budgetLimit={budgetLimit}
          plannedExpenses={plannedExpenses}
          onBudgetLimitChange={setBudgetLimit}
          selectedVendor={selectedVendor}
          onStatusChange={(newStatus) => {
            if (selectedVendorId) {
              dispatch(updateVendorStatus({ id: selectedVendorId, status: newStatus }))
            }
          }}
          onDelete={() => void handleDeleteVendor()}
          onClose={() => setSelectedVendorId(null)}
          userRole={userRole}
          getCategoryLabel={(category) => getVendorCategoryLabel(category, t)}
        />
      </div>

      {/* LUXURY ADD VENDOR MODAL */}
      {showAddModal && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(47, 42, 36, 0.4)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease'
        }}>
          <form 
            onSubmit={handleAddSubmit}
            className="page-card modal-card"
            style={{
              width: '100%',
              maxWidth: '460px',
              background: 'var(--surface)',
              padding: '2.5rem',
              borderRadius: '20px',
              boxShadow: '0 20px 50px rgba(47, 42, 36, 0.15)',
              display: 'grid',
              gap: '1.2rem',
              position: 'relative'
            }}
          >
            <button 
              type="button"
              onClick={() => setShowAddModal(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                color: 'var(--muted)',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>

            <header style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', fontWeight: 600 }}>{t('vendors.modalTag')}</span>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.8rem', margin: '0.25rem 0', fontWeight: 500 }}>{t('vendors.modalTitle')}</h2>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.85rem' }}>{t('vendors.modalSubtitle')}</p>
            </header>

            <label style={{ display: 'grid', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>{t('vendors.fieldCompanyName')}</span>
              <input 
                type="text"
                placeholder="np. Flower Concept Store"
                value={newVendor.companyName}
                onChange={(e) => setNewVendor(prev => ({ ...prev, companyName: e.target.value }))}
                required
                style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
              />
            </label>

            <label style={{ display: 'grid', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>{t('vendors.fieldCategory')}</span>
              <select 
                value={newVendor.serviceType}
                onChange={(e) => setNewVendor(prev => ({ ...prev, serviceType: e.target.value }))}
                style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem', background: 'var(--surface)', color: 'var(--text)' }}
              >
                <option value="Catering">{t('vendors.categories.catering')}</option>
                <option value="Florystyka">{t('vendors.categories.florist')}</option>
                <option value="Fotografia">{t('vendors.categories.photography')}</option>
                <option value="Sala weselna">{t('vendors.categories.venue')}</option>
                <option value="Muzyka">{t('vendors.categories.music')}</option>
              </select>
            </label>

            <label style={{ display: 'grid', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>{t('vendors.fieldContact')}</span>
              <input 
                type="email"
                placeholder={t('vendors.fieldContactPlaceholder')}
                value={newVendor.contact}
                onChange={(e) => setNewVendor(prev => ({ ...prev, contact: e.target.value }))}
                required
                style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
              />
            </label>

            <label style={{ display: 'grid', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>
                {t('vendors.fieldPrice')} ({newVendor.serviceType === 'Catering' ? 'PLN / os.' : 'PLN'})
              </span>
              <input 
                type="number"
                placeholder={newVendor.serviceType === 'Catering' ? 'np. 250' : 'np. 4500'}
                value={newVendor.price}
                onChange={(e) => setNewVendor(prev => ({ ...prev, price: e.target.value }))}
                required
                style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
              />
            </label>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--muted)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {t('vendors.cancelBtn')}
              </button>
              <button 
                type="submit"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'var(--primary)',
                  color: 'var(--on-primary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(184, 90, 31, 0.2)'
                }}
              >
                {t('vendors.addBtn')}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  )
}
