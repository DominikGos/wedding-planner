import type { CateringVendorOption } from '../data/cateringMock'

function DocumentIcon() {
  return (
    <svg
      width='22'
      height='22'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      stroke='#d6a061'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M8 3.5H15L19 7.5V19.5C19 20.328 18.328 21 17.5 21H8C7.172 21 6.5 20.328 6.5 19.5V5C6.5 4.172 7.172 3.5 8 3.5Z' />
      <path d='M15 3.5V7.5H19' />
      <path d='M9.5 11H16' />
      <path d='M9.5 14.5H16' />
    </svg>
  )
}

type VendorSectionProps = {
  vendorOptions: CateringVendorOption[]
  selectedVendorId: string
  notes: string
  onVendorChange: (vendorId: string) => void
  onNotesChange: (notes: string) => void
}

export function VendorSection({
  vendorOptions,
  selectedVendorId,
  notes,
  onVendorChange,
  onNotesChange,
}: VendorSectionProps) {
  const selectedVendor =
    vendorOptions.find((vendor) => vendor.id === selectedVendorId) ?? vendorOptions[0]

  return (
    <article className='page-card' style={{ padding: 0, overflow: 'hidden' }}>
      <div
        style={{
          padding: '1.2rem 1.35rem',
          borderBottom: '1px solid #f1e8dc',
          display: 'flex',
          alignItems: 'center',
          gap: '0.9rem',
        }}
      >
        <div
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '14px',
            background: '#faf3ee',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <DocumentIcon />
        </div>
        <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Wybor Dostawcy</h2>
      </div>

      <div style={{ padding: '1.35rem', display: 'grid', gap: '1rem' }}>
        <div>
          <p style={{ margin: '0 0 0.7rem' }}>Dostawca Cateringu</p>
          <select
            value={selectedVendorId}
            onChange={(event) => onVendorChange(event.target.value)}
            style={{
              minHeight: '50px',
              border: '1px solid #efe4d7',
              borderRadius: '14px',
              background: '#fffdfa',
              padding: '0 1rem',
              width: '100%',
            }}
          >
            {vendorOptions.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.label}    {vendor.details}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            border: '1px solid #efe4d7',
            borderRadius: '16px',
            background: '#fffdfa',
            padding: '1.25rem',
            display: 'grid',
            gap: '0.9rem',
            textAlign: 'left',
          }}
        >
          <span
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <span>
              <strong style={{ display: 'block', fontSize: '1rem' }}>{selectedVendor.label}</strong>
              <span style={{ display: 'block', marginTop: '0.35rem', color: 'var(--muted)' }}>
                4.9 ocena - 156 opinii
              </span>
            </span>
            <span
              style={{
                padding: '0.3rem 0.8rem',
                borderRadius: '999px',
                background: '#d9f9e5',
                color: '#14834b',
                fontWeight: 600,
                alignSelf: 'flex-start',
              }}
            >
              Polecany
            </span>
          </span>

          <span
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
            }}
          >
            <span>
              <span style={{ display: 'block', color: 'var(--muted)' }}>Telefon:</span>
              <strong style={{ display: 'block', marginTop: '0.25rem' }}>+48 123 456 789</strong>
            </span>
            <span>
              <span style={{ display: 'block', color: 'var(--muted)' }}>Email:</span>
              <strong style={{ display: 'block', marginTop: '0.25rem' }}>kontakt@catering.pl</strong>
            </span>
          </span>
        </div>

        <div>
          <p style={{ margin: '0 0 0.7rem' }}>Uwagi specjalne</p>
          <textarea
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            placeholder='Dodaj uwagi dotyczace menu, ograniczen dietetycznych, lub preferencji...'
            style={{
              minHeight: '140px',
              border: '1px solid #efe4d7',
              borderRadius: '16px',
              background: '#fbfaf8',
              color: 'var(--text)',
              padding: '1rem',
              width: '100%',
              resize: 'vertical',
            }}
          />
        </div>
      </div>
    </article>
  )
}
