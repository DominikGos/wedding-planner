export type VendorIconName = 'catering' | 'flowers' | 'camera' | 'venue' | 'music' | 'users' | 'check' | 'clock' | 'x-circle' | 'chevron-right' | 'star' | 'plus' | 'handshake'

type VendorIconProps = {
  name: VendorIconName
  color: string
  size?: number
  strokeWidth?: number
}

export function VendorIcon({
  name,
  color,
  size = 24,
  strokeWidth = 2,
}: VendorIconProps) {
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

  if (name === 'catering') {
    return (
      <svg {...commonProps}>
        <path d='M3 12h18M3 12a9 9 0 0 1 18 0' />
        <path d='M7 16h10a2 2 0 0 1 2 2v2H5v-2a2 2 0 0 1 2-2z' />
        <circle cx='12' cy='12' r='2' fill={color} stroke='none' />
      </svg>
    )
  }

  if (name === 'flowers') {
    return (
      <svg {...commonProps}>
        <circle cx='12' cy='12' r='3' />
        <path d='M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83' />
      </svg>
    )
  }

  if (name === 'camera') {
    return (
      <svg {...commonProps}>
        <path d='M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z' />
        <circle cx='12' cy='13' r='3' />
      </svg>
    )
  }

  if (name === 'venue') {
    return (
      <svg {...commonProps}>
        <path d='M3 21h18M5 21V7l8-4 6 4v14' />
        <path d='M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4' />
      </svg>
    )
  }

  if (name === 'music') {
    return (
      <svg {...commonProps}>
        <path d='M9 18V5l12-2v13' />
        <circle cx='6' cy='18' r='3' />
        <circle cx='18' cy='16' r='3' />
      </svg>
    )
  }

  if (name === 'users') {
    return (
      <svg {...commonProps}>
        <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
        <circle cx='9' cy='7' r='4' />
        <path d='M23 21v-2a4 4 0 0 0-3-3.87' />
        <path d='M16 3.13a4 4 0 0 1 0 7.75' />
      </svg>
    )
  }

  if (name === 'check') {
    return (
      <svg {...commonProps}>
        <polyline points='20 6 9 17 4 12' />
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

  if (name === 'x-circle') {
    return (
      <svg {...commonProps}>
        <circle cx='12' cy='12' r='10' />
        <line x1='15' y1='9' x2='9' y2='15' />
        <line x1='9' y1='9' x2='15' y2='15' />
      </svg>
    )
  }

  if (name === 'chevron-right') {
    return (
      <svg {...commonProps}>
        <polyline points='9 18 15 12 9 6' />
      </svg>
    )
  }

  if (name === 'star') {
    return (
      <svg {...commonProps} fill={color === 'none' ? 'none' : color}>
        <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
      </svg>
    )
  }

  if (name === 'plus') {
    return (
      <svg {...commonProps}>
        <line x1='12' y1='5' x2='12' y2='19' />
        <line x1='5' y1='12' x2='19' y2='12' />
      </svg>
    )
  }

  if (name === 'handshake') {
    return (
      <svg {...commonProps}>
        <path d='m11 17 2 2 6-6' />
        <path d='m8 14 5 5 2-2' />
        <path d='M5 13a4.1 4.1 0 0 0-4 4v2a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2v-2a4 4 0 0 0-4-4' />
        <path d='M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z' />
      </svg>
    )
  }

  return (
    <svg {...commonProps}>
      <circle cx='12' cy='12' r='10' />
    </svg>
  )
}
