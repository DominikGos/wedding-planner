import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../../store'

import { initialMenuSections } from '../data/cateringMock'
import type { CateringMenuSectionData, CateringMenuItem } from '../data/cateringMock'
import type { Vendor } from '../../vendors/data/vendorsMock'

export function CateringPage() {
  // Redux state
  const reduxVendors = useSelector((state: RootState) => state.vendors.items)
  const reduxGuests = useSelector((state: RootState) => state.guests.items)
  
  const caterers = useMemo(() => {
    return reduxVendors.filter((v: Vendor) => v.category === 'Catering')
  }, [reduxVendors])

  // Local State
  const [menuSections, setMenuSections] = useState<CateringMenuSectionData[]>(initialMenuSections)
  const [selectedVendorId, setSelectedVendorId] = useState(caterers[0]?.id || 'delicious')
  const [notes, setNotes] = useState('')
  const [budgetLimit, setBudgetLimit] = useState(30000)
  const [cateringNotification, setCateringNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  
  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setCateringNotification({ text, type })
    setTimeout(() => {
      setCateringNotification(null)
    }, 4000)
  }
  
  // Custom dishes form state
  const [newDish, setNewDish] = useState({
    name: '',
    price: '',
    sectionId: 'main'
  })

  // Dynamic guest dietary requirements calculation
  // Confirmed + Waiting guests + 10% safety buffer
  const guestsDietStats = useMemo(() => {
    const relevantGuests = reduxGuests.filter(g => g.status === 'Potwierdzony' || g.status === 'Oczekuje')
    const totalCount = relevantGuests.length

    // Classify diets based on allergies and mock assignments
    const glutenFreeRaw = relevantGuests.filter(g => g.allergy.toLowerCase().includes('gluten')).length
    const lactoseFreeRaw = relevantGuests.filter(g => g.allergy.toLowerCase().includes('laktoza') || g.allergy.toLowerCase().includes('soja')).length
    const seafoodAllergy = relevantGuests.filter(g => g.allergy.toLowerCase().includes('owoce')).length
    
    // Simulating standard vs vege counts
    const vegetarianRaw = Math.round(totalCount * 0.15) // ~15% vege
    const veganRaw = Math.round(totalCount * 0.05) // ~5% vegan
    const standardRaw = totalCount - (glutenFreeRaw + lactoseFreeRaw + vegetarianRaw + veganRaw)

    // Apply 10% safety buffer (lekka nadwyżka na wszelki wypadek)
    const addBuffer = (val: number) => Math.ceil(val * 1.1)

    return {
      totalGuests: totalCount,
      standard: addBuffer(standardRaw),
      vegetarian: addBuffer(vegetarianRaw),
      vegan: addBuffer(veganRaw),
      glutenFree: addBuffer(glutenFreeRaw),
      lactoseFree: addBuffer(lactoseFreeRaw),
      seafoodAllergy: addBuffer(seafoodAllergy)
    }
  }, [reduxGuests])

  // Sliders/Calculations
  const [guestsCount, setGuestsCount] = useState<number | null>(null)
  const finalGuestsCount = guestsCount ?? guestsDietStats.totalGuests
  
  const checkedItems = useMemo(() => {
    return menuSections.flatMap(section => section.items.filter(item => item.checked))
  }, [menuSections])

  const costPerPerson = useMemo(() => {
    return checkedItems.reduce((total, item) => total + item.price, 0)
  }, [checkedItems])

  const totalCost = costPerPerson * finalGuestsCount
  const fitsBudget = totalCost <= budgetLimit

  // Menu Interactions
  const toggleMenuItem = (sectionId: string, itemId: string) => {
    setMenuSections(current =>
      current.map(section =>
        section.id !== sectionId
          ? section
          : {
              ...section,
              items: section.items.map(item =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              )
            }
      )
    )
  }

  // Adding Custom Dish
  const handleAddDish = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDish.name.trim() || !newDish.price.trim()) {
      showNotification('Proszę podać nazwę potrawy oraz cenę!', 'error')
      return
    }

    const priceNum = Number(newDish.price)
    if (isNaN(priceNum) || priceNum <= 0) {
      showNotification('Cena musi być poprawną liczbą dodatnią!', 'error')
      return
    }

    const createdItem: CateringMenuItem = {
      id: `dish-${Date.now()}`,
      name: newDish.name,
      price: priceNum,
      checked: true // auto checked upon creation
    }

    setMenuSections(current =>
      current.map(section =>
        section.id !== newDish.sectionId
          ? section
          : {
              ...section,
              items: [...section.items, createdItem]
            }
      )
    )

    showNotification(`Pomyślnie dodano potrawę "${createdItem.name}" do kategorii!`, 'success')
    setNewDish({ name: '', price: '', sectionId: 'main' })
  }

  const selectedCaterer = useMemo(() => {
    return caterers.find((c: Vendor) => c.id === selectedVendorId) || null
  }, [selectedVendorId, caterers])

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      
      {cateringNotification && (
        <div style={{
          padding: '1rem',
          borderRadius: '12px',
          background: cateringNotification.type === 'success' ? 'color-mix(in srgb, var(--ok) 14%, var(--surface))' : 'var(--danger-soft)',
          color: cateringNotification.type === 'success' ? 'var(--ok)' : 'var(--danger)',
          border: `1px solid ${cateringNotification.type === 'success' ? 'var(--ok)' : 'var(--danger)'}`,
          fontWeight: 600,
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease'
        }}>
          {cateringNotification.text}
        </div>
      )}

      {/* HEADER */}
      <header className="page-card" style={{
        padding: '1.6rem',
        background: 'linear-gradient(180deg, var(--surface) 0%, var(--surface-soft) 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--primary)', fontWeight: 600 }}>Moduł Kulinarny</span>
          <h1 className='page-title' style={{ fontSize: '2rem', marginTop: '0.25rem' }}>Catering i Menu Weselne</h1>
          <p className='page-subtitle' style={{ fontSize: '1.05rem' }}>Skomponuj kartę dań, dobierz catering i kontroluj diety gości.</p>
        </div>
        <button 
          onClick={() => {
            showNotification('Konfiguracja cateringu została pomyślnie zapisana!', 'success')
          }}
          className='button-primary'
        >
          Zapisz Konfigurację
        </button>
      </header>

      {/* THREE STATS / CALCULATIONS CARDS */}
      <div className="stats-grid">
        <div style={calcCardStyle}>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>CENA ZA OSOBĘ</span>
          <strong style={{ fontSize: '1.8rem', color: 'var(--primary)', margin: '0.25rem 0' }}>
            {costPerPerson} PLN
          </strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Wybranych dań: {checkedItems.length}</span>
        </div>

        <div style={calcCardStyle}>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>SZACUNKI KOSZTÓW</span>
          <strong style={{ fontSize: '1.8rem', color: fitsBudget ? '#35684f' : '#c53030', margin: '0.25rem 0' }}>
            {totalCost.toLocaleString()} PLN
          </strong>
          <span style={{
            fontSize: '0.75rem', 
            fontWeight: 600,
            color: fitsBudget ? '#35684f' : '#c53030',
            background: fitsBudget ? 'color-mix(in srgb, var(--ok) 14%, var(--surface))' : 'var(--danger-soft)',
            padding: '0.2rem 0.5rem',
            borderRadius: '10px',
            alignSelf: 'center'
          }}>
            {fitsBudget ? 'Mieści się w budżecie' : `Przekroczono o ${(totalCost - budgetLimit).toLocaleString()} PLN`}
          </span>
        </div>

        <div style={calcCardStyle}>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>BUDŻET CATERINGU</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0', justifyContent: 'center' }}>
            <strong style={{ fontSize: '1.5rem' }}>{budgetLimit.toLocaleString()} PLN</strong>
            <button 
              onClick={() => {
                const val = prompt('Wpisz nowy limit budżetu na catering:', budgetLimit.toString())
                if (val && !isNaN(Number(val))) setBudgetLimit(Number(val))
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
            >
              ✏️
            </button>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Liczba gości: {finalGuestsCount} osób</span>
        </div>
      </div>

      {/* TWO-COLUMN WORKSPACE */}
      <div className="catering-layout" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 1.8fr) minmax(280px, 0.9fr)',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        
        {/* Left Column: Menu sections and new dish form */}
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          
          {/* Menu Sections Golden restaurant Card */}
          <section className="page-card" style={{ padding: '2.5rem', border: '2px solid var(--border)', background: 'var(--surface)' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--primary)', fontWeight: 600 }}>Karta Ślubna</span>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2.2rem', margin: '0.5rem 0', fontWeight: 400 }}>Menu Weselne</h2>
              <div style={{ width: '60px', height: '1px', background: '#d4af37', margin: '0.75rem auto' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>Zaznacz potrawy, które znajdą się na stołach weselnych.</p>
            </div>

            <div style={{ display: 'grid', gap: '2rem' }}>
              {menuSections.map((section) => (
                <div key={section.id} style={{ display: 'grid', gap: '1rem' }}>
                  <h3 style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '1.4rem',
                    color: 'var(--text)',
                    margin: 0,
                    borderBottom: '1px dashed var(--border)',
                    paddingBottom: '0.5rem',
                    fontWeight: 400
                  }}>
                    {section.title}
                  </h3>
                  
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {section.items.map((item) => (
                      <label 
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          borderRadius: '10px',
                          border: `1px solid ${item.checked ? 'var(--primary)' : 'var(--border)'}`,
                          background: item.checked ? 'var(--primary-soft)' : 'var(--surface)',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <input 
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => toggleMenuItem(section.id, item.id)}
                            style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                          />
                          <span style={{ fontWeight: item.checked ? 600 : 500, color: 'var(--text)', fontSize: '0.95rem' }}>{item.name}</span>
                        </div>
                        <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{item.price} PLN</strong>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* New Dish Creator Form */}
          <section className="page-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.3rem', margin: '0 0 1rem', fontWeight: 500 }}>
              + Dodaj nową potrawę do Menu
            </h3>
            
            <form className="catering-dish-form" onSubmit={handleAddDish} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr auto', gap: '0.85rem', alignItems: 'end' }}>
              <label style={{ display: 'grid', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)' }}>Nazwa potrawy</span>
                <input 
                  type="text"
                  placeholder="np. Rosół z makaronem"
                  value={newDish.name}
                  onChange={(e) => setNewDish(prev => ({ ...prev, name: e.target.value }))}
                  style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)' }}>Cena (PLN)</span>
                <input 
                  type="number"
                  placeholder="np. 25"
                  value={newDish.price}
                  onChange={(e) => setNewDish(prev => ({ ...prev, price: e.target.value }))}
                  style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)' }}>Kategoria dania</span>
                <select 
                  value={newDish.sectionId}
                  onChange={(e) => setNewDish(prev => ({ ...prev, sectionId: e.target.value }))}
                  style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem', background: 'var(--surface)', color: 'var(--text)' }}
                >
                  <option value="starters">Przystawki</option>
                  <option value="main">Dania główne</option>
                  <option value="dessert">Desery</option>
                </select>
              </label>

              <button 
                type="submit"
                style={{
                  height: '42px',
                  padding: '0 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--primary)',
                  color: 'var(--on-primary)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Dodaj
              </button>
            </form>
          </section>

        </div>

        {/* Right Column: Dietary Summary & Vendor Selection */}
        <div className="catering-sidebar" style={{ display: 'grid', gap: '1.5rem', position: 'sticky', top: '1rem' }}>
          
          {/* Guest Dietary requirements summary card */}
          <section className="page-card" style={{ padding: '1.5rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Zapotrzebowanie diet gości</h3>
              <span style={{
                fontSize: '0.7rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '8px',
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                fontWeight: 600
              }}>
                Zapas 10% wliczony 🛡️
              </span>
            </header>

            <div style={{ display: 'grid', gap: '0.9rem' }}>
              <div style={dietRowStyle}>
                <span style={{ color: 'var(--muted)' }}>Klasyczne / Standard:</span>
                <strong>{guestsDietStats.standard} porcji</strong>
              </div>
              <div style={dietRowStyle}>
                <span style={{ color: 'var(--muted)' }}>Wegetariańskie (Vege):</span>
                <strong style={{ color: '#0ea44b' }}>{guestsDietStats.vegetarian} porcji</strong>
              </div>
              <div style={dietRowStyle}>
                <span style={{ color: 'var(--muted)' }}>Wegańskie (Vegan):</span>
                <strong style={{ color: '#35684f' }}>{guestsDietStats.vegan} porcji</strong>
              </div>
              <div style={dietRowStyle}>
                <span style={{ color: 'var(--muted)' }}>Bezglutenowe (Gluten-Free):</span>
                <strong style={{ color: '#d9a15f' }}>{guestsDietStats.glutenFree} porcji</strong>
              </div>
              <div style={dietRowStyle}>
                <span style={{ color: 'var(--muted)' }}>Bez laktozy (Lactose-Free):</span>
                <strong style={{ color: '#8c5a12' }}>{guestsDietStats.lactoseFree} porcji</strong>
              </div>
              <div style={dietRowStyle}>
                <span style={{ color: 'var(--muted)' }}>Uczulenie na owoce morza:</span>
                <strong style={{ color: '#c53030' }}>{guestsDietStats.seafoodAllergy} porcji</strong>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', marginTop: '1.2rem', paddingTop: '1rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: '1.4', display: 'block' }}>
                Wyliczono na podstawie <strong>{guestsDietStats.totalGuests}</strong> gości o statusach <em>Potwierdzony</em> oraz <em>Oczekuje</em> z bazy danych gości.
              </span>
            </div>
          </section>

          {/* Interactive Guest Slider */}
          <section className="page-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>Dostosuj szacunek osób</h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>Liczba Gości do kalkulatora:</span>
                <strong style={{ color: 'var(--primary)' }}>{finalGuestsCount} osób</strong>
              </label>
              <input 
                type="range"
                min="10"
                max="300"
                step="5"
                value={finalGuestsCount}
                onChange={(e) => setGuestsCount(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.1rem' }}>
                <span>10 osób</span>
                <span>{guestsDietStats.totalGuests} (z bazy)</span>
                <span>300 osób</span>
              </div>
            </div>
          </section>

          {/* Vendor Selection (caterers only) */}
          <section className="page-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.8rem', fontSize: '1rem', fontWeight: 700 }}>Firma Cateringowa</h3>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <select 
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  fontSize: '0.95rem',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontWeight: 600
                }}
              >
                {caterers.map((c: Vendor) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.priceFrom})
                  </option>
                ))}
                {caterers.length === 0 && (
                  <option value="delicious">Delicious Catering (150 PLN / os.)</option>
                )}
              </select>

              {selectedCaterer && (
                <div style={{
                  background: 'var(--bg-accent)',
                  padding: '1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--muted)' }}>Ocena firmy:</span>
                    <strong>⭐ {selectedCaterer.rating} / 5.0</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--muted)' }}>Adres E-mail:</span>
                    <strong>{selectedCaterer.email}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Status dostawcy:</span>
                    <strong style={{ color: selectedCaterer.status === 'confirmed' ? '#35684f' : '#8c5a12' }}>
                      {selectedCaterer.status === 'confirmed' ? 'Potwierdzona współpraca' : 'Oczekujący'}
                    </strong>
                  </div>
                </div>
              )}

              <label style={{ display: 'grid', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)' }}>Uwagi kucharza / Logistyka:</span>
                <textarea 
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="np. Dowóz ciepłych posiłków o godz. 17:00, 19:30, 22:00..."
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '0.85rem',
                    resize: 'vertical',
                    fontFamily: 'sans-serif'
                  }}
                />
              </label>
            </div>
          </section>

        </div>

      </div>
    </div>
  )
}

const calcCardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '1.2rem',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  boxShadow: '0 4px 12px rgba(47, 42, 36, 0.02)'
}

const dietRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.9rem',
  borderBottom: '1px solid var(--border)',
  paddingBottom: '0.55rem'
}
