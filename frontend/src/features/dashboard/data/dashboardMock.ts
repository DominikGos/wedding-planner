export type DashboardIconName =
  | 'trend'
  | 'users'
  | 'group'
  | 'check'
  | 'check-circle'
  | 'calendar'
  | 'clock'
  | 'alert'

export type TopCardItem = {
  id: string
  title: string
  value: string
  note: string
  color: string
  icon: DashboardIconName
}

export type BudgetItem = {
  id: string
  name: string
  amount: string
  color: string
}

export type DashboardEvent = {
  id: string
  title: string
  date: string
  time: string
  status: string
}

export type GuestStat = {
  id: string
  value: string
  label: string
  color: string
  background: string
  icon: DashboardIconName
}

export const topCards: TopCardItem[] = [
  {
    id: 'budget',
    title: 'Calkowity Budzet',
    value: '45 000 PLN',
    note: '+12% od poczatku',
    color: '#d6a061',
    icon: 'trend',
  },
  {
    id: 'guests',
    title: 'Potwierdzeni Goscie',
    value: '142/192',
    note: '74% potwierdzen',
    color: '#0ea44b',
    icon: 'users',
  },
  {
    id: 'tasks',
    title: 'Zadania Ukonczone',
    value: '18/32',
    note: '56% postepu',
    color: '#2c67f6',
    icon: 'check',
  },
  {
    id: 'days',
    title: 'Dni do Slubu',
    value: '48',
    note: '10 maja 2026',
    color: '#ff3d6c',
    icon: 'calendar',
  },
]

export const budgetItems: BudgetItem[] = [
  { id: 'catering', name: 'Catering', amount: '15 000 PLN', color: '#d9a15f' },
  { id: 'venue', name: 'Miejsce', amount: '12 000 PLN', color: '#f39bd0' },
  { id: 'decor', name: 'Dekoracje', amount: '8000 PLN', color: '#f5d9eb' },
  { id: 'photo', name: 'Fotografia', amount: '6000 PLN', color: '#c9bca5' },
  { id: 'other', name: 'Inne', amount: '4000 PLN', color: '#dcc2ff' },
]

export const events: DashboardEvent[] = [
  { id: 'meeting', title: 'Spotkanie z cateringiem', date: '2026-03-25', time: '14:00', status: 'Zaplanowane' },
  { id: 'menu', title: 'Degustacja menu', date: '2026-03-28', time: '18:00', status: 'W trakcie' },
  { id: 'decor', title: 'Finalizacja dekoracji', date: '2026-04-02', time: '10:00', status: 'W trakcie' },
  { id: 'rehearsal', title: 'Proba generalna', date: '2026-04-10', time: '16:00', status: 'Wazne' },
]

export const guestStats: GuestStat[] = [
  { id: 'confirmed', value: '142', label: 'Potwierdzeni', color: '#0ea44b', background: '#eefbf2', icon: 'check-circle' },
  { id: 'waiting', value: '38', label: 'Oczekujacy', color: '#ef8a00', background: '#fff9e9', icon: 'clock' },
  { id: 'rejected', value: '12', label: 'Odrzuceni', color: '#eb1d1d', background: '#fff3f3', icon: 'alert' },
  { id: 'all', value: '192', label: 'Suma', color: '#d6a061', background: '#fcf7f0', icon: 'group' },
]
