import { useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../../store'
import { addVendor, updateVendorStatus } from '../../../store/slices/vendorsSlice'

import { VendorStatCard } from '../components/VendorStatCard'
import { VendorTable } from '../components/VendorTable'
import { VendorSidebar } from '../components/VendorSidebar'
import { VendorIcon } from '../components/VendorIcon'
import { vendorCategories, type Vendor } from '../data/vendorsMock'

export function VendorsPage() {
  const dispatch = useDispatch()
  const vendors = useSelector((state: RootState) => state.vendors.items)

  const user = useSelector((state: RootState) => state.auth.user)
  const userRole = user?.role || 'couple'

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [budgetLimit, setBudgetLimit] = useState(30000)
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

  const filteredVendors = useMemo(() => {
    return vendors.filter((v: Vendor) => {
      const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) || 
                           v.email.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === 'All' || v.category === categoryFilter
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [vendors, search, categoryFilter, statusFilter])

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVendor.companyName.trim() || !newVendor.contact.trim() || !newVendor.price.trim()) {
      showNotification('Proszę wypełnić wszystkie pola!', 'error')
      return
    }

    const iconMap: Record<string, string> = {
      Catering: 'catering',
      Florystyka: 'flowers',
      Fotografia: 'camera',
      'Sala weselna': 'venue',
      Muzyka: 'music'
    }

    const created: Vendor = {
      id: `v-${Date.now()}`,
      name: newVendor.companyName,
      email: newVendor.contact,
      category: newVendor.serviceType,
      rating: 5.0,
      reviewsCount: 0,
      status: 'pending',
      priceFrom: newVendor.serviceType === 'Catering'
        ? `${Number(newVendor.price).toLocaleString()} PLN / os.`
        : `${Number(newVendor.price).toLocaleString()} PLN`,
      icon: iconMap[newVendor.serviceType] || 'users'
    }

    dispatch(addVendor(created))
    showNotification(`Dodano pomyślnie dostawcę "${created.name}" do bazy ślubnej!`, 'success')
    
    // Reset state
    setShowAddModal(false)
    setNewVendor({
      companyName: '',
      serviceType: 'Catering',
      contact: '',
      price: ''
    })
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {vendorsNotification && (
        <div style={{
          padding: '1rem',
          borderRadius: '12px',
          background: vendorsNotification.type === 'success' ? '#daf6e5' : '#fff2f2',
          color: vendorsNotification.type === 'success' ? '#14834b' : '#c53030',
          border: `1px solid ${vendorsNotification.type === 'success' ? '#bfeecf' : '#f4c1c1'}`,
          fontWeight: 600,
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease'
        }}>
          {vendorsNotification.text}
        </div>
      )}
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className='page-title'>Dostawcy</h1>
          <p className='page-subtitle'>Zarządzaj dostawcami i współpracą przy organizacji wydarzenia.</p>
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
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(184, 90, 31, 0.2)'
              }}
            >
              <VendorIcon name='plus' color='#fff' size={18} strokeWidth={2.5} />
              Dodaj dostawcę
            </button>
          </div>
        )}
      </header>

      {/* STATS */}
      <div className='stats-grid'>
        <VendorStatCard 
          title="Wszyscy dostawcy" 
          value={stats.total} 
          note="Wszyscy aktywni dostawcy"
          color="#b85a1f" 
          icon="users" 
        />
        <VendorStatCard 
          title="Potwierdzeni" 
          value={stats.confirmed} 
          note="Gotowi do współpracy"
          color="#35684f" 
          icon="check" 
        />
        <VendorStatCard 
          title="Oczekujący" 
          value={stats.pending} 
          note="Czekają na odpowiedź"
          color="#8c5a12" 
          icon="clock" 
        />
        <VendorStatCard 
          title="Niedostępni" 
          value={stats.unavailable} 
          note="Brak odpowiedzi / odrzuceni"
          color="#c53030" 
          icon="x-circle" 
        />
      </div>

      {/* MAIN TWO-COLUMN CONTAINER */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'minmax(0, 2.5fr) minmax(300px, 1fr)', 
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        
        {/* Table & Filter list */}
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1.5fr 1fr 1fr', 
            gap: '0.75rem',
            alignItems: 'center' 
          }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Szukaj dostawcy..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem 0.7rem 2.5rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  fontSize: '0.9rem',
                  background: '#fff'
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
                background: '#fff'
              }}
            >
              <option value="All">Kategoria: Wszystkie</option>
              {vendorCategories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.7rem 1rem',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                fontSize: '0.9rem',
                background: '#fff'
              }}
            >
              <option value="All">Status: Wszystkie</option>
              <option value="confirmed">Potwierdzony</option>
              <option value="pending">Oczekujący</option>
              <option value="unavailable">Niedostępny</option>
            </select>
          </div>

          <section className='page-card' style={{ padding: 0, overflow: 'hidden' }}>
            <VendorTable 
              vendors={filteredVendors} 
              onSelectVendor={(v) => setSelectedVendorId(v.id)} 
              selectedVendorId={selectedVendorId}
            />
            
            <div style={{ 
              padding: '1.25rem', 
              borderTop: '1px solid #f6f3ed', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                Wyświetlanie 1-{filteredVendors.length} z {stats.total} dostawców
              </span>
            </div>
          </section>
        </div>

        {/* Sidebar details panel */}
        <VendorSidebar 
          categories={vendorCategories} 
          budgetLimit={budgetLimit}
          onBudgetLimitChange={setBudgetLimit}
          selectedVendor={selectedVendor}
          onStatusChange={(newStatus) => {
            if (selectedVendorId) {
              dispatch(updateVendorStatus({ id: selectedVendorId, status: newStatus }))
            }
          }}
          onClose={() => setSelectedVendorId(null)}
          userRole={userRole}
        />
      </div>

      {/* LUXURY ADD VENDOR MODAL */}
      {showAddModal && (
        <div style={{
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
            className="page-card" 
            style={{
              width: '100%',
              maxWidth: '460px',
              background: '#fff',
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
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', fontWeight: 600 }}>Kreator Umów</span>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.8rem', margin: '0.25rem 0', fontWeight: 500 }}>Nowy Dostawca</h2>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.85rem' }}>Wprowadź dane dostawcy zgodnie ze strukturą encji bazy danych.</p>
            </header>

            <label style={{ display: 'grid', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Nazwa Firmy (JPA: companyName)</span>
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
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Kategoria Usług (JPA: serviceType)</span>
              <select 
                value={newVendor.serviceType}
                onChange={(e) => setNewVendor(prev => ({ ...prev, serviceType: e.target.value }))}
                style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem', background: '#fff' }}
              >
                <option value="Catering">Catering</option>
                <option value="Florystyka">Florystyka</option>
                <option value="Fotografia">Fotografia</option>
                <option value="Sala weselna">Sala weselna</option>
                <option value="Muzyka">Muzyka</option>
              </select>
            </label>

            <label style={{ display: 'grid', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Kontakt / E-mail (JPA: contact)</span>
              <input 
                type="email"
                placeholder="np. kontakt@biuro.pl"
                value={newVendor.contact}
                onChange={(e) => setNewVendor(prev => ({ ...prev, contact: e.target.value }))}
                required
                style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
              />
            </label>

            <label style={{ display: 'grid', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>
                Cena Orientacyjna ({newVendor.serviceType === 'Catering' ? 'PLN / os.' : 'PLN'})
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
                  background: '#fff',
                  color: 'var(--muted)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Anuluj
              </button>
              <button 
                type="submit"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(184, 90, 31, 0.2)'
                }}
              >
                Dodaj
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  )
}
