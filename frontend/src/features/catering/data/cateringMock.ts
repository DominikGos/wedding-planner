export type CateringMenuItem = {
  id: string
  name: string
  price: number
  checked: boolean
}

export type CateringMenuSectionData = {
  id: string
  title: string
  items: CateringMenuItem[]
}

export type CateringVendorOption = {
  id: string
  label: string
  details: string
}

export type CateringTaskInfo = {
  date: string
  assignee: string
  priority: string
}

export type CateringDocument = {
  id: string
  fileName: string
  uploadedAt: string
}

export const initialMenuSections: CateringMenuSectionData[] = [
  {
    id: 'starters',
    title: 'Przystawki',
    items: [
      { id: 'tatar', name: 'Tatar z lososia', price: 45, checked: true },
      { id: 'carpaccio', name: 'Carpaccio wolowe', price: 38, checked: true },
    ],
  },
  {
    id: 'main',
    title: 'Danie glowne',
    items: [
      { id: 'pork', name: 'Poledwica wieprzowa', price: 85, checked: true },
      { id: 'salmon', name: 'Losos norweski', price: 95, checked: false },
    ],
  },
  {
    id: 'dessert',
    title: 'Deser',
    items: [
      { id: 'tiramisu', name: 'Tiramisu', price: 28, checked: true },
      { id: 'creme', name: 'Creme brulee', price: 32, checked: false },
    ],
  },
]

export const vendorOptions: CateringVendorOption[] = [
  { id: 'delicious', label: 'Delicious Catering', details: '4.9 (156 opinii)' },
  { id: 'royal', label: 'Royal Catering', details: '4.8 (112 opinii)' },
  { id: 'garden', label: 'Garden Menu', details: '4.7 (89 opinii)' },
]

export const taskInfo: CateringTaskInfo = {
  date: '28 marca 2026',
  assignee: 'Anna Kowalska',
  priority: 'Wysoki',
}

export const documents: CateringDocument[] = [
  {
    id: 'document-1',
    fileName: 'umowa-catering-v2.pdf',
    uploadedAt: 'Przeslano 15 marca 2026',
  },
]

export const guestsCount = 150
export const budgetLimit = 30000
export const validationContent = {
  title: 'Formularz zweryfikowany',
  text: 'Wszystkie wymagane pola zostaly uzupelnione poprawnie.',
}
