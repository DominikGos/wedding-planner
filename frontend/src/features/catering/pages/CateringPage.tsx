import { useMemo, useState } from 'react'
import { CateringHeader } from '../components/CateringHeader'
import { CostSummaryCard } from '../components/CostSummaryCard'
import { DocumentsSection } from '../components/DocumentsSection'
import { MenuSection } from '../components/MenuSection'
import { TaskInfoCard } from '../components/TaskInfoCard'
import { ValidationCard } from '../components/ValidationCard'
import { VendorSection } from '../components/VendorSection'
import {
  budgetLimit,
  documents,
  guestsCount,
  initialMenuSections,
  taskInfo,
  validationContent,
  vendorOptions,
} from '../data/cateringMock'

export function CateringPage() {
  const [menuSections, setMenuSections] = useState(initialMenuSections)
  const [selectedItemId, setSelectedItemId] = useState(initialMenuSections[0].items[0].id)
  const [formState, setFormState] = useState({
    vendorId: vendorOptions[0].id,
    notes: '',
  })

  const checkedItems = useMemo(
    () => menuSections.flatMap((section) => section.items.filter((item) => item.checked)),
    [menuSections],
  )
  const costPerPerson = checkedItems.reduce((total, item) => total + item.price, 0)
  const totalCost = costPerPerson * guestsCount

  const toggleMenuItem = (sectionId: string, itemId: string) => {
    setSelectedItemId(itemId)
    setMenuSections((current) =>
      current.map((section) =>
        section.id !== sectionId
          ? section
          : {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, checked: !item.checked } : item,
              ),
            },
      ),
    )
  }

  return (
    <section style={{ display: 'grid', gap: '1rem' }}>
      <CateringHeader
        onBack={() => console.log('catering:back')}
        onCancel={() => {
          setFormState({
            vendorId: vendorOptions[0].id,
            notes: '',
          })
          setMenuSections(initialMenuSections)
          setSelectedItemId(initialMenuSections[0].items[0].id)
          console.log('catering:cancel')
        }}
        onSave={() => console.log('catering:save', formState)}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 1.8fr) minmax(280px, 0.85fr)',
          gap: '1rem',
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'grid', gap: '1rem' }}>
          <MenuSection
            sections={menuSections}
            selectedItemId={selectedItemId}
            onToggleItem={toggleMenuItem}
          />

          <VendorSection
            vendorOptions={vendorOptions}
            selectedVendorId={formState.vendorId}
            notes={formState.notes}
            onVendorChange={(vendorId) =>
              setFormState((current) => ({
                ...current,
                vendorId,
              }))
            }
            onNotesChange={(notes) =>
              setFormState((current) => ({
                ...current,
                notes,
              }))
            }
          />

          <DocumentsSection
            documents={documents}
            onUpload={() => console.log('catering:upload')}
            onPreview={(documentId) => console.log('catering:file-preview', documentId)}
          />
        </div>

        <div style={{ display: 'grid', gap: '1rem', position: 'sticky', top: '1rem' }}>
          <CostSummaryCard
            costPerPerson={costPerPerson}
            guestsCount={guestsCount}
            selectedItems={checkedItems.length}
            totalCost={totalCost}
            fitsBudget={totalCost <= budgetLimit}
          />

          <TaskInfoCard info={taskInfo} />

          <ValidationCard
            title={validationContent.title}
            text={validationContent.text}
          />
        </div>
      </div>
    </section>
  )
}
