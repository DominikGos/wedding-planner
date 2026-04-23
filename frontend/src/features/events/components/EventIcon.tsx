import type { EventIconName } from '../data/eventsMock'

type EventIconProps = {
  name: EventIconName
  color: string
  size?: number
}

export function EventIcon({
  name,
  color,
  size = 20,
}: EventIconProps) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  if (name === 'calendar') {
    return (
      <svg {...commonProps}>
        <rect x='4' y='5.5' width='16' height='14.5' rx='2.5' />
        <path d='M8 3.5V7' />
        <path d='M16 3.5V7' />
        <path d='M4 9.5H20' />
        <path d='M8 13H11' />
        <path d='M13 13H16' />
      </svg>
    )
  }

  if (name === 'bell') {
    return (
      <svg {...commonProps}>
        <path d='M12 5.5C9.79 5.5 8 7.29 8 9.5V11.2C8 12.1 7.68 12.97 7.1 13.65L6 15H18L16.9 13.65C16.32 12.97 16 12.1 16 11.2V9.5C16 7.29 14.21 5.5 12 5.5Z' />
        <path d='M10.5 18C10.9 18.62 11.41 19 12 19C12.59 19 13.1 18.62 13.5 18' />
      </svg>
    )
  }

  if (name === 'leaf') {
    return (
      <svg {...commonProps}>
        <path d='M12 19C16 16.8 18 13.5 18 9C15.5 9 13.7 9.7 12.4 11.1C11.1 12.5 10.4 14.3 10.4 16.8' />
        <path d='M12 19C8 16.8 6 13.5 6 9C8.5 9 10.3 9.7 11.6 11.1C12.9 12.5 13.6 14.3 13.6 16.8' />
        <path d='M12 9V20' />
      </svg>
    )
  }

  if (name === 'document') {
    return (
      <svg {...commonProps}>
        <path d='M8 3.5H15L19 7.5V19.5C19 20.328 18.328 21 17.5 21H8C7.172 21 6.5 20.328 6.5 19.5V5C6.5 4.172 7.172 3.5 8 3.5Z' />
        <path d='M15 3.5V7.5H19' />
        <path d='M9.5 11H16' />
        <path d='M9.5 14.5H16' />
      </svg>
    )
  }

  if (name === 'music') {
    return (
      <svg {...commonProps}>
        <path d='M15 5V14' />
        <path d='M9 7.5V16.5' />
        <path d='M15 5L9 7.5' />
        <circle cx='8' cy='17' r='2' />
        <circle cx='14' cy='14.5' r='2' />
      </svg>
    )
  }

  if (name === 'heart') {
    return (
      <svg {...commonProps}>
        <path d='M12 19C12 19 5.5 15 5.5 10C5.5 7.79 7.29 6 9.5 6C10.78 6 11.92 6.6 12.66 7.54C13.4 6.6 14.54 6 15.82 6C18.03 6 19.82 7.79 19.82 10C19.82 15 13.32 19 13.32 19H12Z' />
      </svg>
    )
  }

  if (name === 'clock') {
    return (
      <svg {...commonProps}>
        <circle cx='12' cy='12' r='8.5' />
        <path d='M12 8V12L15 13.8' />
      </svg>
    )
  }

  if (name === 'filter') {
    return (
      <svg {...commonProps}>
        <path d='M4 6H20' />
        <path d='M7 12H17' />
        <path d='M10 18H14' />
      </svg>
    )
  }

  return (
    <svg {...commonProps}>
      <circle cx='12' cy='12' r='8' />
    </svg>
  )
}
