import type { CateringDocument } from '../data/cateringMock'

function DocumentIcon({
  size = 22,
  color = '#d6a061',
}: {
  size?: number
  color?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      stroke={color}
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

function UploadIcon() {
  return (
    <svg
      width='44'
      height='44'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      stroke='#d6a061'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M12 16V4' />
      <path d='M7 9L12 4L17 9' />
      <path d='M5 20H19' />
    </svg>
  )
}

type DocumentsSectionProps = {
  documents: CateringDocument[]
  onUpload: () => void
  onPreview: (documentId: string) => void
}

export function DocumentsSection({
  documents,
  onUpload,
  onPreview,
}: DocumentsSectionProps) {
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
        <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Dokumenty Umowy</h2>
      </div>

      <div style={{ padding: '1.35rem', display: 'grid', gap: '1rem' }}>
        <button
          type='button'
          onClick={onUpload}
          style={{
            minHeight: '220px',
            border: '2px dashed #f0ddca',
            borderRadius: '18px',
            display: 'grid',
            placeItems: 'center',
            textAlign: 'center',
            color: 'var(--muted)',
            padding: '1rem',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          <span>
            <span style={{ display: 'grid', placeItems: 'center', marginBottom: '1rem' }}>
              <UploadIcon />
            </span>
            <strong style={{ display: 'block', color: 'var(--text)', fontSize: '1.05rem' }}>
              Kliknij aby przeslac lub przeciagnij plik
            </strong>
            <span style={{ display: 'block', marginTop: '0.45rem' }}>PDF, DOC, DOCX do 10MB</span>
          </span>
        </button>

        {documents.map((document) => (
          <button
            key={document.id}
            type='button'
            onClick={() => onPreview(document.id)}
            style={{
              border: '1px solid #efe4d7',
              borderRadius: '16px',
              background: '#fffdfa',
              padding: '1rem 1.1rem',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1rem',
              alignItems: 'center',
              flexWrap: 'wrap',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span style={{ display: 'flex', gap: '0.9rem', alignItems: 'center' }}>
              <DocumentIcon />
              <span>
                <strong style={{ display: 'block' }}>{document.fileName}</strong>
                <span
                  style={{
                    display: 'block',
                    marginTop: '0.25rem',
                    color: 'var(--muted)',
                  }}
                >
                  {document.uploadedAt}
                </span>
              </span>
            </span>
            <span style={{ color: '#d6a061', fontWeight: 600 }}>Podglad</span>
          </button>
        ))}
      </div>
    </article>
  )
}
