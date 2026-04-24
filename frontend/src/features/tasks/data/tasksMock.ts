export type TaskStatus = 'Do zrobienia' | 'W trakcie' | 'Zrobione'
export type TaskCategory = 'Catering' | 'Dekoracje' | 'Fotografia' | 'Muzyka' | 'Wydarzenie'
export type TaskPriority = 'Niski' | 'Sredni' | 'Wysoki'

export type TaskItem = {
  id: string
  name: string
  description: string
  category: TaskCategory
  date: string
  time: string
  status: TaskStatus
  budget: number
  priority: TaskPriority
  assignee: string
  checked: boolean
  color: string
}

export const plannedBudget = 60000

export const categoryOptions: Array<'Wszystkie kategorie' | TaskCategory> = [
  'Wszystkie kategorie',
  'Catering',
  'Dekoracje',
  'Fotografia',
  'Muzyka',
  'Wydarzenie',
]

export const statusOptions: Array<'Wszystkie statusy' | TaskStatus> = [
  'Wszystkie statusy',
  'Do zrobienia',
  'W trakcie',
  'Zrobione',
]

export const assigneeOptions = [
  'Anna Kowalska',
  'Maria Nowak',
  'Jakub Zielinski',
]

export const initialTasks: TaskItem[] = [
  {
    id: 'task-1',
    name: 'Spotkanie z cateringiem',
    description: 'Omowienie menu i warunkow',
    category: 'Catering',
    date: '2026-03-25',
    time: '14:00',
    status: 'Do zrobienia',
    budget: 0,
    priority: 'Sredni',
    assignee: 'Anna Kowalska',
    checked: false,
    color: '#b57be8',
  },
  {
    id: 'task-2',
    name: 'Degustacja menu',
    description: 'Degustacja wybranych dan',
    category: 'Catering',
    date: '2026-03-28',
    time: '18:00',
    status: 'W trakcie',
    budget: 0,
    priority: 'Wysoki',
    assignee: 'Anna Kowalska',
    checked: false,
    color: '#ffbd45',
  },
  {
    id: 'task-3',
    name: 'Finalizacja dekoracji',
    description: 'Ustalenie ostatecznego wygladu',
    category: 'Dekoracje',
    date: '2026-04-02',
    time: '10:00',
    status: 'W trakcie',
    budget: 8000,
    priority: 'Wysoki',
    assignee: 'Maria Nowak',
    checked: true,
    color: '#58c983',
  },
  {
    id: 'task-4',
    name: 'Platnosc zaliczki za fotografa',
    description: 'Zaliczka 40% wartosci uslugi',
    category: 'Fotografia',
    date: '2026-04-10',
    time: '12:00',
    status: 'Zrobione',
    budget: 2000,
    priority: 'Sredni',
    assignee: 'Jakub Zielinski',
    checked: true,
    color: '#ff8ba0',
  },
  {
    id: 'task-5',
    name: 'Proba zespolu',
    description: 'Proba generalna zespolu',
    category: 'Muzyka',
    date: '2026-04-20',
    time: '16:00',
    status: 'W trakcie',
    budget: 3500,
    priority: 'Sredni',
    assignee: 'Anna Kowalska',
    checked: false,
    color: '#ffad63',
  },
  {
    id: 'task-6',
    name: 'Dzien slubu',
    description: 'Glowny dzien wydarzenia',
    category: 'Wydarzenie',
    date: '2026-05-10',
    time: '15:00',
    status: 'Zrobione',
    budget: 31500,
    priority: 'Wysoki',
    assignee: 'Anna Kowalska',
    checked: false,
    color: '#ff9aaa',
  },
]
