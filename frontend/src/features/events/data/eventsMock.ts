export type EventIconName =
  | 'calendar'
  | 'bell'
  | 'leaf'
  | 'document'
  | 'music'
  | 'heart'
  | 'clock'
  | 'filter'

export type TimelineItem = {
  id: string
  month: string
  day: string
  weekDay: string
  title: string
  subtitle: string
  category: string
  time: string
  status: string
  color: string
  icon: EventIconName
}

export type Reminder = {
  id: string
  title: string
  date: string
  time: string
  color: string
  icon: EventIconName
}

export const filterTabs = ['Wszystkie', 'Zadania', 'Spotkania', 'Wydarzenia', 'Platnosci']

export const tabToSubtitleMap: Record<string, string | null> = {
  Wszystkie: null,
  Zadania: 'Zadanie',
  Spotkania: 'Spotkanie',
  Wydarzenia: 'Wydarzenie',
  Platnosci: 'Platnosc',
}

export const initialTimelineItems: TimelineItem[] = [
  {
    id: 'meeting',
    month: 'MAR 2026',
    day: '25',
    weekDay: 'Wt',
    title: 'Spotkanie z cateringiem',
    subtitle: 'Spotkanie',
    category: 'Catering',
    time: '14:00',
    status: 'Zaplanowane',
    color: '#b57be8',
    icon: 'calendar',
  },
  {
    id: 'menu',
    month: 'MAR 2026',
    day: '28',
    weekDay: 'Sob',
    title: 'Degustacja menu',
    subtitle: 'Zadanie',
    category: 'Catering',
    time: '18:00',
    status: 'Zaplanowane',
    color: '#ffbd45',
    icon: 'bell',
  },
  {
    id: 'decor',
    month: 'KWI 2026',
    day: '02',
    weekDay: 'Czw',
    title: 'Finalizacja dekoracji',
    subtitle: 'Zadanie',
    category: 'Dekoracje',
    time: '10:00',
    status: 'Zaplanowane',
    color: '#58c983',
    icon: 'leaf',
  },
  {
    id: 'payment',
    month: 'KWI 2026',
    day: '10',
    weekDay: 'Pt',
    title: 'Platnosc zaliczki za fotografa',
    subtitle: 'Platnosc',
    category: 'Fotografia',
    time: '2 000 PLN',
    status: 'Oplacone',
    color: '#ff8ba0',
    icon: 'document',
  },
  {
    id: 'music',
    month: 'KWI 2026',
    day: '20',
    weekDay: 'Pon',
    title: 'Proba zespolu',
    subtitle: 'Zadanie',
    category: 'Muzyka',
    time: '16:00',
    status: 'W trakcie',
    color: '#ffad63',
    icon: 'music',
  },
  {
    id: 'wedding',
    month: 'MAJ 2026',
    day: '10',
    weekDay: 'Ndz',
    title: 'Dzien slubu',
    subtitle: 'Wydarzenie',
    category: '',
    time: '15:00',
    status: 'Nadchodzace',
    color: '#ff9aaa',
    icon: 'heart',
  },
]

export const initialReminders: Reminder[] = [
  {
    id: 'r1',
    title: 'Spotkanie z cateringiem',
    date: '25 mar 2026',
    time: '14:00',
    color: '#b57be8',
    icon: 'calendar',
  },
  {
    id: 'r2',
    title: 'Degustacja menu',
    date: '28 mar 2026',
    time: '18:00',
    color: '#ffbd45',
    icon: 'bell',
  },
  {
    id: 'r3',
    title: 'Finalizacja dekoracji',
    date: '2 kwi 2026',
    time: '10:00',
    color: '#58c983',
    icon: 'leaf',
  },
]

export const calendarRows = [
  ['23', '24', '25', '26', '27', '28', '1'],
  ['2', '3', '4', '5', '6', '7', '8'],
  ['9', '10', '11', '12', '13', '14', '15'],
  ['16', '17', '18', '19', '20', '21', '22'],
  ['23', '24', '25', '26', '27', '28', '29'],
  ['30', '31', '1', '2', '3', '4', '5'],
]
