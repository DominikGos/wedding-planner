export interface Vendor {
  id: string
  name: string
  email: string
  category: string
  rating: number
  reviewsCount: number
  status: 'confirmed' | 'pending' | 'unavailable'
  priceFrom: string
  icon: string
}

export interface VendorCategory {
  name: string
  count: number
  icon: string
}

export const vendors: Vendor[] = [
  {
    id: 'v1',
    name: 'Delicious Catering',
    email: 'delicious@catering.pl',
    category: 'Catering',
    rating: 4.9,
    reviewsCount: 156,
    status: 'confirmed',
    priceFrom: '150 PLN / os.',
    icon: 'catering'
  },
  {
    id: 'v2',
    name: 'Flowers & More',
    email: 'kontakt@flowersmore.pl',
    category: 'Florystyka',
    rating: 4.8,
    reviewsCount: 98,
    status: 'confirmed',
    priceFrom: '2 500 PLN',
    icon: 'flowers'
  },
  {
    id: 'v3',
    name: 'Foto Studio Pro',
    email: 'biuro@fotostudio.pl',
    category: 'Fotografia',
    rating: 4.7,
    reviewsCount: 73,
    status: 'pending',
    priceFrom: '3 000 PLN',
    icon: 'camera'
  },
  {
    id: 'v4',
    name: 'Dream Venue',
    email: 'eventy@dreamvenue.pl',
    category: 'Sala weselna',
    rating: 4.9,
    reviewsCount: 210,
    status: 'confirmed',
    priceFrom: '15 000 PLN',
    icon: 'venue'
  },
  {
    id: 'v5',
    name: 'Muzyka na Żywo',
    email: 'kontakt@muzyka.pl',
    category: 'Muzyka',
    rating: 4.6,
    reviewsCount: 45,
    status: 'unavailable',
    priceFrom: '2 000 PLN',
    icon: 'music'
  }
]

export const vendorCategories: VendorCategory[] = [
  { name: 'Catering', count: 3, icon: 'catering' },
  { name: 'Florystyka', count: 2, icon: 'flowers' },
  { name: 'Fotografia', count: 2, icon: 'camera' },
  { name: 'Sala weselna', count: 2, icon: 'venue' },
  { name: 'Muzyka', count: 2, icon: 'music' }
]

export const vendorStats = {
  total: 12,
  confirmed: 8,
  pending: 2,
  unavailable: 2,
  plannedExpenses: 22500,
  budgetLimit: 30000
}
