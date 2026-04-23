import { useState, useMemo } from 'react'
import { VendorStatCard } from '../components/VendorStatCard'
import { VendorTable } from '../components/VendorTable'
import { VendorSidebar } from '../components/VendorSidebar'
import { VendorIcon } from '../components/VendorIcon'
import { vendors as initialVendors, vendorCategories, vendorStats } from '../data/vendorsMock'

export function VendorsPage() {
  const [vendors] = useState(initialVendors)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [budgetLimit, setBudgetLimit] = useState(vendorStats.budgetLimit)

  const stats = useMemo(() => {
    const total = vendors.length
    const confirmed = vendors.filter(v => v.status === 'confirmed').length
    const pending = vendors.filter(v => v.status === 'pending').length
    const unavailable = vendors.filter(v => v.status === 'unavailable').length
    
    // For planned expenses, let's sum some base values or keep as is if not in vendor data
    // In a real app, this would come from contract data
    return { total, confirmed, pending, unavailable }
  }, [vendors])

  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) || 
                           v.email.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === 'All' || v.category === categoryFilter
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [vendors, search, categoryFilter, statusFilter])

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className='page-title'>Dostawcy</h1>
          <p className='page-subtitle'>Zarządzaj dostawcami i współpracą przy organizacji wydarzenia.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            Ślub: <strong>Maria &amp; Jakub</strong>
          </div>
          <button style={{
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
          }}>
            <VendorIcon name='plus' color='#fff' size={18} strokeWidth={2.5} />
            Dodaj dostawcę
          </button>
        </div>
      </header>

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

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'minmax(0, 2.5fr) minmax(300px, 1fr)', 
        gap: '1.5rem',
        alignItems: 'start'
      }}>
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
            <VendorTable vendors={filteredVendors} />
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
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button style={paginationButtonStyle}>&lt;</button>
                <button style={{ ...paginationButtonStyle, background: 'var(--primary-soft)', color: 'var(--primary)', fontWeight: 700 }}>1</button>
                <button style={paginationButtonStyle}>2</button>
                <button style={paginationButtonStyle}>3</button>
                <button style={paginationButtonStyle}>&gt;</button>
              </div>
            </div>
          </section>
        </div>

        <VendorSidebar 
          categories={vendorCategories} 
          budgetLimit={budgetLimit}
          onBudgetLimitChange={setBudgetLimit}
        />
      </div>

      <section style={{
        background: 'linear-gradient(90deg, #fdfaf5 0%, #fff 100%)',
        border: '1px solid #f1e8dc',
        borderRadius: '20px',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '50%',
            background: 'var(--bg-accent)',
            display: 'grid',
            placeItems: 'center'
          }}>
            <VendorIcon name='handshake' color='var(--primary)' size={32} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Współpraca z dostawcami</h3>
            <p style={{ margin: '0.4rem 0 0', color: 'var(--muted)', fontSize: '0.95rem' }}>
              Dodawaj dostawców, porównuj oferty i zarządzaj umowami w jednym miejscu.
            </p>
          </div>
        </div>
        <button style={{
          padding: '0.75rem 1.5rem',
          background: 'none',
          border: '1px solid var(--primary)',
          color: 'var(--primary)',
          borderRadius: '10px',
          fontWeight: 600,
          cursor: 'pointer'
        }}>
          Dowiedz się więcej
        </button>
      </section>
    </div>
  )
}

const paginationButtonStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  border: 'none',
  background: 'none',
  fontSize: '0.85rem',
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
  color: 'var(--muted)'
}
