export type GuestStatus = 'Potwierdzony' | 'Oczekuje' | 'Odrzucony'

export type Guest = {
  id: string
  name: string
  status: GuestStatus
  table: string
  allergy: string
}

export const initialGuests: Guest[] = [
  { id: 'jan', name: 'Jan Nowak', status: 'Potwierdzony', table: '1', allergy: 'Brak' },
  { id: 'maria', name: 'Maria Kowalska', status: 'Potwierdzony', table: '1', allergy: 'Orzechy' },
  { id: 'piotr', name: 'Piotr Wisniewski', status: 'Oczekuje', table: '2', allergy: 'Brak' },
  { id: 'anna', name: 'Anna Wojcik', status: 'Potwierdzony', table: '2', allergy: 'Laktoza' },
  { id: 'tomasz', name: 'Tomasz Kaminski', status: 'Odrzucony', table: '-', allergy: 'Brak' },
  { id: 'katarzyna', name: 'Katarzyna Lewandowska', status: 'Potwierdzony', table: '3', allergy: 'Gluten' },
  { id: 'marek', name: 'Marek Zielinski', status: 'Oczekuje', table: '3', allergy: 'Brak' },
  { id: 'ewa', name: 'Ewa Szymanska', status: 'Potwierdzony', table: '4', allergy: 'Owoce morza' },
  { id: 'michal', name: 'Michal Wozniak', status: 'Potwierdzony', table: '4', allergy: 'Brak' },
  { id: 'joanna', name: 'Joanna Dabrowska', status: 'Oczekuje', table: '5', allergy: 'Brak' },
  { id: 'krzysztof', name: 'Krzysztof Kozlowski', status: 'Potwierdzony', table: '5', allergy: 'Soja' },
  { id: 'magdalena', name: 'Magdalena Jankowska', status: 'Potwierdzony', table: '6', allergy: 'Brak' },
]
