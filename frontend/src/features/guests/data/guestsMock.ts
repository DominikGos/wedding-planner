export type GuestStatus = 'Potwierdzony' | 'Oczekuje' | 'Odrzucony'

export type Guest = {
  id: string
  name: string
  email: string
  status: GuestStatus
  table: string
  allergy: string
  declineReason?: string
  guestCode?: string
}

export const initialGuests: Guest[] = [
  { id: 'jan', name: 'Jan Nowak', email: 'jan.nowak@gmail.com', status: 'Potwierdzony', table: '1', allergy: 'Brak' },
  { id: 'maria', name: 'Maria Kowalska', email: 'maria.kowalska@yahoo.com', status: 'Potwierdzony', table: '1', allergy: 'Orzechy' },
  { id: 'piotr', name: 'Piotr Wisniewski', email: 'p.wisniewski@outlook.com', status: 'Oczekuje', table: '2', allergy: 'Brak' },
  { id: 'anna', name: 'Anna Wojcik', email: 'anna.wojcik@gmail.com', status: 'Potwierdzony', table: '2', allergy: 'Laktoza' },
  { id: 'tomasz', name: 'Tomasz Kaminski', email: 't.kaminski@interia.pl', status: 'Odrzucony', table: '-', allergy: 'Brak' },
  { id: 'katarzyna', name: 'Katarzyna Lewandowska', email: 'k.lewandowska@gmail.com', status: 'Potwierdzony', table: '3', allergy: 'Gluten' },
  { id: 'marek', name: 'Marek Zielinski', email: 'm.zielinski@wp.pl', status: 'Oczekuje', table: '3', allergy: 'Brak' },
  { id: 'ewa', name: 'Ewa Szymanska', email: 'ewa.szymanska@gmail.com', status: 'Potwierdzony', table: '4', allergy: 'Owoce morza' },
  { id: 'michal', name: 'Michal Wozniak', email: 'm.wozniak@gmail.com', status: 'Potwierdzony', table: '4', allergy: 'Brak' },
  { id: 'joanna', name: 'Joanna Dabrowska', email: 'j.dabrowska@yahoo.com', status: 'Oczekuje', table: '5', allergy: 'Brak' },
  { id: 'krzysztof', name: 'Krzysztof Kozlowski', email: 'k.kozlowski@outlook.com', status: 'Potwierdzony', table: '5', allergy: 'Soja' },
  { id: 'magdalena', name: 'Magdalena Jankowska', email: 'm.jankowska@gmail.com', status: 'Potwierdzony', table: '6', allergy: 'Brak' },
]
