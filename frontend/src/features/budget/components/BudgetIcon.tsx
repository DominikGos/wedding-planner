export type BudgetIconName = 'trend' | 'check' | 'clock' | 'alert' | 'wallet' | 'file-text' | 'history' | 'user'

type BudgetIconProps = {
  name: BudgetIconName
  color: string
  size?: number
  strokeWidth?: number
}

export function BudgetIcon({
  name,
  color,
  size = 24,
  strokeWidth = 2,
}: BudgetIconProps) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  if (name === 'wallet') {
    return (
      <svg {...commonProps}>
        <path d='M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3' />
        <path d='M3 10h18' />
        <path d='M16 10v8' />
      </svg>
    )
  }

  if (name === 'trend') {
    return (
      <svg {...commonProps}>
        <path d='M5 15L10 10L13 13L19 7' />
        <path d='M14 7H19V12' />
      </svg>
    )
  }

  if (name === 'check') {
    return (
      <svg {...commonProps}>
        <path d='M20 6L9 17l-5-5' />
      </svg>
    )
  }

  if (name === 'clock') {
    return (
      <svg {...commonProps}>
        <circle cx='12' cy='12' r='10' />
        <polyline points='12 6 12 12 16 14' />
      </svg>
    )
  }

  if (name === 'alert') {
    return (
      <svg {...commonProps}>
        <circle cx='12' cy='12' r='10' />
        <line x1='12' y1='8' x2='12' y2='12' />
        <line x1='12' y1='16' x2='12.01' y2='16' />
      </svg>
    )
  }

  if (name === 'file-text') {
    return (
      <svg {...commonProps}>
        <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
        <polyline points='14 2 14 8 20 8' />
        <line x1='16' y1='13' x2='8' y2='13' />
        <line x1='16' y1='17' x2='8' y2='17' />
        <polyline points='10 9 9 9 8 9' />
      </svg>
    )
  }

  if (name === 'history') {
    return (
      <svg {...commonProps}>
        <path d='M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' />
        <path d='M3 3v5h5' />
        <path d='M12 7v5l4 2' />
      </svg>
    )
  }

  if (name === 'user') {
    return (
      <svg {...commonProps}>
        <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
        <circle cx='12' cy='7' r='4' />
      </svg>
    )
  }

  return (
    <svg {...commonProps}>
      <circle cx='12' cy='12' r='10' />
    </svg>
  )
}
