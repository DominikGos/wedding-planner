import type { DashboardIconName } from '../data/dashboardMock'

type DashboardIconProps = {
  name: DashboardIconName
  color: string
  size?: number
  strokeWidth?: number
}

export function DashboardIcon({
  name,
  color,
  size = 28,
  strokeWidth = 1.8,
}: DashboardIconProps) {
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

  if (name === 'trend') {
    return (
      <svg {...commonProps}>
        <path d='M5 15L10 10L13 13L19 7' />
        <path d='M14 7H19V12' />
      </svg>
    )
  }

  if (name === 'users' || name === 'group') {
    return (
      <svg {...commonProps}>
        <path d='M16 19V17.5C16 15.567 14.433 14 12.5 14H8.5C6.567 14 5 15.567 5 17.5V19' />
        <circle cx='10.5' cy='8' r='3' />
        <path d='M17 10.5C18.657 10.5 20 9.157 20 7.5C20 5.843 18.657 4.5 17 4.5' />
        <path d='M19 19V17.8C19 16.232 17.986 14.844 16.5 14.368' />
      </svg>
    )
  }

  if (name === 'check' || name === 'check-circle') {
    return (
      <svg {...commonProps}>
        <circle cx='12' cy='12' r='8.5' />
        <path d='M8.8 12.3L11.1 14.6L15.4 10.2' />
      </svg>
    )
  }

  if (name === 'calendar') {
    return (
      <svg {...commonProps}>
        <rect x='4' y='5.5' width='16' height='14.5' rx='2.5' />
        <path d='M8 3.5V7' />
        <path d='M16 3.5V7' />
        <path d='M4 9.5H20' />
      </svg>
    )
  }

  if (name === 'clock') {
    return (
      <svg {...commonProps}>
        <circle cx='12' cy='12' r='8.5' />
        <path d='M12 7.5V12L15.5 14' />
      </svg>
    )
  }

  if (name === 'alert') {
    return (
      <svg {...commonProps}>
        <circle cx='12' cy='12' r='8.5' />
        <path d='M12 8V12.5' />
        <circle cx='12' cy='16' r='0.8' fill={color} stroke='none' />
      </svg>
    )
  }

  return (
    <svg {...commonProps}>
      <circle cx='9' cy='9' r='4' />
      <path d='M3.8 18.5C4.8 16.1 7 14.5 9.6 14.5C12.2 14.5 14.4 16.1 15.4 18.5' />
      <circle cx='16.8' cy='8.2' r='2.8' />
      <path d='M15.5 14.8C17.7 15.2 19.5 16.6 20.2 18.5' />
    </svg>
  )
}
