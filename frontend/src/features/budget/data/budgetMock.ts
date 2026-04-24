export interface Payment {
  id: string
  vendor: string
  invoiceNumber: string
  service: string
  amount: number
  deadline: string
  paidAt?: string
  status: 'paid' | 'pending' | 'overdue'
}

export interface HistoryEntry {
  id: string
  type: 'payment_confirmed' | 'reminder_sent' | 'invoice_created'
  title: string
  description: string
  date: string
  user: {
    name: string
    initials: string
  }
}

export const paymentStats = {
  total: 41000,
  paid: 10000,
  pending: 23000,
  overdue: 8000,
  paidCount: 2,
  totalCount: 6,
}

export const payments: Payment[] = [
  {
    id: '1',
    vendor: 'Delicious Catering',
    invoiceNumber: 'INV-2026-001',
    service: 'Catering - Zaliczka',
    amount: 7500,
    deadline: '2026-03-30',
    paidAt: '2026-03-18',
    status: 'paid',
  },
  {
    id: '2',
    vendor: 'Golden Venue',
    invoiceNumber: 'INV-2026-002',
    service: 'Wynajem sali',
    amount: 12000,
    deadline: '2026-04-01',
    status: 'pending',
  },
  {
    id: '3',
    vendor: 'Flower Dreams',
    invoiceNumber: 'INV-2026-003',
    service: 'Dekoracje kwiatowe',
    amount: 8000,
    deadline: '2026-03-20',
    status: 'overdue',
  },
  {
    id: '4',
    vendor: 'Perfect Moments Photography',
    invoiceNumber: 'INV-2026-004',
    service: 'Fotografia i film',
    amount: 6000,
    deadline: '2026-04-05',
    status: 'pending',
  },
  {
    id: '5',
    vendor: 'Sweet Dreams Bakery',
    invoiceNumber: 'INV-2026-005',
    service: 'Tort weselny',
    amount: 2500,
    deadline: '2026-03-25',
    paidAt: '2026-03-22',
    status: 'paid',
  },
  {
    id: '6',
    vendor: 'Elite Music Band',
    invoiceNumber: 'INV-2026-006',
    service: 'Zespol muzyczny',
    amount: 5000,
    deadline: '2026-04-10',
    status: 'pending',
  },
]

export const history: HistoryEntry[] = [
  {
    id: 'h1',
    type: 'payment_confirmed',
    title: 'Zatwierdzono płatność',
    description: 'Płatność zaliczki dla Delicious Catering została zatwierdzona',
    date: '2026-03-18 14:30',
    user: { name: 'Anna Kowalska', initials: 'AK' },
  },
  {
    id: 'h2',
    type: 'payment_confirmed',
    title: 'Zatwierdzono płatność',
    description: 'Płatność za tort weselny została zatwierdzona',
    date: '2026-03-22 09:15',
    user: { name: 'Anna Kowalska', initials: 'AK' },
  },
  {
    id: 'h3',
    type: 'reminder_sent',
    title: 'Przypomnienie wysłane',
    description: 'Automatyczne przypomnienie o zaległej płatności dla Flower Dreams',
    date: '2026-03-21 10:00',
    user: { name: 'System', initials: 'S' },
  },
  {
    id: 'h4',
    type: 'invoice_created',
    title: 'Utworzono fakturę',
    description: 'Faktura za wynajem sali została wygenerowana',
    date: '2026-03-15 16:45',
    user: { name: 'Anna Kowalska', initials: 'AK' },
  },
]
