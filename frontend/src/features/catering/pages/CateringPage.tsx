import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import type { RootState } from '../../../store'
import { getEvent, updateEvent, type EventResponse } from '../../../api/eventApi'

import { emptyMenuSections } from '../data/cateringMock'
import type { CateringMenuSectionData, CateringMenuItem } from '../data/cateringMock'
import type { Vendor } from '../../vendors/data/vendorsMock'

export function CateringPage() {
  const { t } = useTranslation()
  // Redux state
  const reduxVendors = useSelector((state: RootState) => state.vendors.items)
  const reduxGuests = useSelector((state: RootState) => state.guests.items)
  
  const caterers = useMemo(() => {
    return reduxVendors.filter((v: Vendor) => v.category === 'Catering')
  }, [reduxVendors])

  const activeWeddingId = useSelector((state: RootState) => state.auth.activeWeddingId)
  const token = useSelector((state: RootState) => state.auth.token)
  
  // Local State
  const [menuSections, setMenuSections] = useState<CateringMenuSectionData[]>(emptyMenuSections)
  const [selectedVendorId, setSelectedVendorId] = useState(caterers[0]?.id || 'delicious')
  const [notes, setNotes] = useState('')
  const [budgetLimit, setBudgetLimit] = useState(30000)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [tempBudget, setTempBudget] = useState('')
  const [cateringNotification, setCateringNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [currentEvent, setCurrentEvent] = useState<EventResponse | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setCateringNotification({ text, type })
    setTimeout(() => {
      setCateringNotification(null)
    }, 4000)
  }

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault()
    const val = Number(tempBudget)
    if (!isNaN(val) && val >= 0) {
      setBudgetLimit(val)
      setShowBudgetModal(false)
    }
  }

  useEffect(() => {
    if (!activeWeddingId || !token) return
    let active = true

    const loadEventCatering = async () => {
      try {
        const eventData = await getEvent(activeWeddingId, { token })
        if (!active) return
        setCurrentEvent(eventData)
        setNotes(eventData.cateringNotes || '')
        if (eventData.cateringMenu) {
          try {
            setMenuSections(JSON.parse(eventData.cateringMenu))
          } catch (e) {
            console.error("Failed to parse catering menu JSON:", e)
            setMenuSections(emptyMenuSections)
          }
        } else {
          setMenuSections(emptyMenuSections)
        }
      } catch (err) {
        console.error("Failed to load event catering config:", err)
      }
    }

    void loadEventCatering()
    return () => {
      active = false
    }
  }, [activeWeddingId, token])

  const handleSaveCatering = async () => {
    if (!activeWeddingId || !token || !currentEvent) {
      showNotification(t('catering.noActiveEvent'), 'error')
      return
    }

    setIsSaving(true)
    try {
      const updated = await updateEvent(
        activeWeddingId,
        {
          name: currentEvent.name,
          eventDate: currentEvent.eventDate,
          location: currentEvent.location ?? '',
          status: currentEvent.status,
          cateringNotes: notes,
          cateringMenu: JSON.stringify(menuSections),
        },
        { token }
      )
      setCurrentEvent(updated)
      showNotification(t('catering.savedSuccess'), 'success')
    } catch {
      showNotification(t('catering.saveError'), 'error')
    } finally {
      setIsSaving(false)
    }
  }
  
  // Custom dishes form state
  const [newDish, setNewDish] = useState({
    name: '',
    price: '',
    sectionId: 'main'
  })

  // Dynamic guest dietary requirements calculation
  const guestsDietStats = useMemo(() => {
    const relevantGuests = reduxGuests.filter(g => g.status === 'Potwierdzony' || g.status === 'Oczekuje')
    const totalCount = relevantGuests.length

    const glutenFreeRaw = relevantGuests.filter(g => g.allergy.toLowerCase().includes('gluten')).length
    const lactoseFreeRaw = relevantGuests.filter(g => g.allergy.toLowerCase().includes('laktoza') || g.allergy.toLowerCase().includes('soja')).length
    const seafoodAllergy = relevantGuests.filter(g => g.allergy.toLowerCase().includes('owoce')).length
    
    const vegetarianRaw = Math.round(totalCount * 0.15)
    const veganRaw = Math.round(totalCount * 0.05)
    const standardRaw = totalCount - (glutenFreeRaw + lactoseFreeRaw + vegetarianRaw + veganRaw)

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

  const removeMenuItem = (sectionId: string, itemId: string) => {
    setMenuSections(current =>
      current.map(section =>
        section.id !== sectionId
          ? section
          : {
              ...section,
              items: section.items.filter(item => item.id !== itemId)
            }
      )
    )
  }

  // Adding Custom Dish
  const handleAddDish = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDish.name.trim() || !newDish.price.trim()) {
      showNotification(t('catering.dishNameRequired'), 'error')
      return
    }

    const priceNum = Number(newDish.price)
    if (isNaN(priceNum) || priceNum <= 0) {
      showNotification(t('catering.invalidDishPrice'), 'error')
      return
    }

    const createdItem: CateringMenuItem = {
      id: `dish-${Date.now()}`,
      name: newDish.name,
      price: priceNum,
      checked: true
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

    showNotification(t('catering.dishAddedSuccess', { name: createdItem.name }), 'success')
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
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--primary)', fontWeight: 600 }}>{t('catering.pageTag')}</span>
          <h1 className='page-title' style={{ fontSize: '2rem', marginTop: '0.25rem' }}>{t('catering.pageTitle')}</h1>
          <p className='page-subtitle' style={{ fontSize: '1.05rem' }}>{t('catering.pageSubtitle')}</p>
        </div>
        <button 
          onClick={handleSaveCatering}
          disabled={isSaving}
          className='button-primary'
          style={{ opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'wait' : 'pointer' }}
        >
          {isSaving ? t('catering.saving') : t('catering.saveConfig')}
        </button>
      </header>

      {/* THREE STATS / CALCULATIONS CARDS */}
      <div className="stats-grid">
        <div style={calcCardStyle}>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>{t('catering.costPerPerson')}</span>
          <strong style={{ fontSize: '1.8rem', color: 'var(--primary)', margin: '0.25rem 0' }}>
            {costPerPerson} PLN
          </strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{t('catering.selectedDishes', { count: checkedItems.length })}</span>
        </div>

        <div style={calcCardStyle}>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>{t('catering.costEstimate')}</span>
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
            {fitsBudget ? t('catering.withinBudget') : t('catering.overBudget', { amount: (totalCost - budgetLimit).toLocaleString() })}
          </span>
        </div>

        <div style={calcCardStyle}>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>{t('catering.cateringBudget')}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0', justifyContent: 'center' }}>
            <strong style={{ fontSize: '1.5rem' }}>{budgetLimit.toLocaleString()} PLN</strong>
            <button 
              onClick={() => {
                setTempBudget(budgetLimit.toString())
                setShowBudgetModal(true)
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
            >
              ✏️
            </button>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{t('catering.guestsCount', { count: finalGuestsCount })}</span>
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
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--primary)', fontWeight: 600 }}>{t('catering.menuTag')}</span>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2.2rem', margin: '0.5rem 0', fontWeight: 400 }}>{t('catering.menuTitle')}</h2>
              <div style={{ width: '60px', height: '1px', background: '#d4af37', margin: '0.75rem auto' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>{t('catering.menuSubtitle')}</p>
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
                    {section.id === 'starters' 
                      ? t('catering.catStarters') 
                      : section.id === 'main' 
                        ? t('catering.catMain') 
                        : section.id === 'dessert' 
                          ? t('catering.catDessert') 
                          : section.title}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                          <strong style={{ color: 'var(--primary)', fontSize: '1rem', whiteSpace: 'nowrap' }}>{item.price} PLN</strong>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault()
                              removeMenuItem(section.id, item.id)
                            }}
                            style={{
                              padding: '0.3rem 0.55rem',
                              borderRadius: '8px',
                              border: '1px solid var(--border)',
                              background: 'var(--surface)',
                              color: 'var(--danger)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {t('catering.removeDishBtn')}
                          </button>
                        </div>
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
              {t('catering.addDishTitle')}
            </h3>
            
            <form className="catering-dish-form" onSubmit={handleAddDish} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr auto', gap: '0.85rem', alignItems: 'end' }}>
              <label style={{ display: 'grid', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)' }}>{t('catering.fieldDishName')}</span>
                <input 
                  type="text"
                  placeholder={t('catering.fieldDishNamePlaceholder')}
                  value={newDish.name}
                  onChange={(e) => setNewDish(prev => ({ ...prev, name: e.target.value }))}
                  style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)' }}>{t('catering.fieldDishPrice')}</span>
                <input 
                  type="number"
                  placeholder="np. 25"
                  value={newDish.price}
                  onChange={(e) => setNewDish(prev => ({ ...prev, price: e.target.value }))}
                  style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)' }}>{t('catering.fieldDishCategory')}</span>
                <select 
                  value={newDish.sectionId}
                  onChange={(e) => setNewDish(prev => ({ ...prev, sectionId: e.target.value }))}
                  style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem', background: 'var(--surface)', color: 'var(--text)' }}
                >
                  <option value="starters">{t('catering.catStarters')}</option>
                  <option value="main">{t('catering.catMain')}</option>
                  <option value="dessert">{t('catering.catDessert')}</option>
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
                {t('catering.addDishBtn')}
              </button>
            </form>
          </section>

        </div>

        {/* Right Column: Dietary Summary & Vendor Selection */}
        <div className="catering-sidebar" style={{ display: 'grid', gap: '1.5rem', position: 'sticky', top: '1rem' }}>
          
          {/* Guest Dietary requirements summary card */}
          <section className="page-card" style={{ padding: '1.5rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{t('catering.dietTitle')}</h3>
              <span style={{
                fontSize: '0.7rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '8px',
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                fontWeight: 600
              }}>
                {t('catering.dietBuffer')}
              </span>
            </header>

            <div style={{ display: 'grid', gap: '0.9rem' }}>
              <div style={dietRowStyle}>
                <span style={{ color: 'var(--muted)' }}>{t('catering.dietStandard')}</span>
                <strong>{t('catering.portions', { count: guestsDietStats.standard })}</strong>
              </div>
              <div style={dietRowStyle}>
                <span style={{ color: 'var(--muted)' }}>{t('catering.dietVegetarian')}</span>
                <strong style={{ color: '#0ea44b' }}>{t('catering.portions', { count: guestsDietStats.vegetarian })}</strong>
              </div>
              <div style={dietRowStyle}>
                <span style={{ color: 'var(--muted)' }}>{t('catering.dietVegan')}</span>
                <strong style={{ color: '#35684f' }}>{t('catering.portions', { count: guestsDietStats.vegan })}</strong>
              </div>
              <div style={dietRowStyle}>
                <span style={{ color: 'var(--muted)' }}>{t('catering.dietGlutenFree')}</span>
                <strong style={{ color: '#d9a15f' }}>{t('catering.portions', { count: guestsDietStats.glutenFree })}</strong>
              </div>
              <div style={dietRowStyle}>
                <span style={{ color: 'var(--muted)' }}>{t('catering.dietLactoseFree')}</span>
                <strong style={{ color: '#8c5a12' }}>{t('catering.portions', { count: guestsDietStats.lactoseFree })}</strong>
              </div>
              <div style={dietRowStyle}>
                <span style={{ color: 'var(--muted)' }}>{t('catering.dietSeafood')}</span>
                <strong style={{ color: '#c53030' }}>{t('catering.portions', { count: guestsDietStats.seafoodAllergy })}</strong>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', marginTop: '1.2rem', paddingTop: '1rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: '1.4', display: 'block' }}>
                {t('catering.dietNote', { count: guestsDietStats.totalGuests })}
              </span>
            </div>
          </section>

          {/* Interactive Guest Slider */}
          <section className="page-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>{t('catering.sliderTitle')}</h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>{t('catering.sliderLabel')}</span>
                <strong style={{ color: 'var(--primary)' }}>{t('catering.sliderPersons', { count: finalGuestsCount })}</strong>
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
                <span>{t('catering.sliderMin')}</span>
                <span>{t('catering.sliderFromDb', { count: guestsDietStats.totalGuests })}</span>
                <span>{t('catering.sliderMax')}</span>
              </div>
            </div>
          </section>

          {/* Vendor Selection (caterers only) */}
          <section className="page-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.8rem', fontSize: '1rem', fontWeight: 700 }}>{t('catering.cateringCompany')}</h3>
            
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
                    <span style={{ color: 'var(--muted)' }}>{t('catering.ratingLabel')}</span>
                    <strong>⭐ {selectedCaterer.rating} / 5.0</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--muted)' }}>{t('catering.emailLabel')}</span>
                    <strong>{selectedCaterer.email}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>{t('catering.statusLabel')}</span>
                    <strong style={{ color: selectedCaterer.status === 'confirmed' ? '#35684f' : '#8c5a12' }}>
                      {selectedCaterer.status === 'confirmed' ? t('catering.statusConfirmed') : t('catering.statusPending')}
                    </strong>
                  </div>
                </div>
              )}

              <label style={{ display: 'grid', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)' }}>{t('catering.notesLabel')}</span>
                <textarea 
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('catering.notesPlaceholder')}
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

      {/* Premium Budget Dialog Modal */}
      {showBudgetModal && (
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
            onSubmit={handleSaveBudget}
            className="page-card modal-card"
            style={{
              width: '100%',
              maxWidth: '400px',
              background: 'var(--surface)',
              padding: '2.2rem',
              borderRadius: '20px',
              boxShadow: '0 20px 50px rgba(47, 42, 36, 0.15)',
              display: 'grid',
              gap: '1.2rem',
              position: 'relative'
            }}
          >
            <button 
              type="button"
              onClick={() => setShowBudgetModal(false)}
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
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', fontWeight: 600 }}>{t('catering.cateringBudget')}</span>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.6rem', margin: '0.25rem 0', fontWeight: 500 }}>{t('catering.cateringBudget')}</h2>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.85rem' }}>{t('catering.budgetPrompt')}</p>
            </header>

            <label style={{ display: 'grid', gap: '0.4rem' }}>
              <input 
                type="number"
                min="0"
                value={tempBudget}
                onChange={(e) => setTempBudget(e.target.value)}
                required
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1.05rem', textAlign: 'center', fontWeight: 600, background: 'var(--surface)', color: 'var(--text)' }}
              />
            </label>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                onClick={() => setShowBudgetModal(false)} 
                className="button-secondary" 
                style={{ flex: 1, minHeight: '44px' }}
              >
                {t('common.cancel')}
              </button>
              <button 
                type="submit" 
                className="button-primary" 
                style={{ flex: 1, minHeight: '44px' }}
              >
                {t('common.save')}
              </button>
            </div>
          </form>
        </div>
      )}
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
