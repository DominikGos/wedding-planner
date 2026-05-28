import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface Wedding {
  id: string
  name: string
  date: string
  budget: number
  guestsCount: number
  venue: string
  style: string
}

export interface User {
  name: string
  email: string
  role: 'couple' | 'planner'
  weddingDate?: string
}

interface AuthState {
  user: User | null
  activeWeddingId: string | null
  weddings: Wedding[]
}

const mockWeddings: Wedding[] = [
  {
    id: 'w-1',
    name: 'Maria & Jakub',
    date: '2026-08-15',
    budget: 45000,
    guestsCount: 120,
    venue: 'Złoty Dwór, Warszawa',
    style: 'Glamour',
  },
  {
    id: 'w-2',
    name: 'Katarzyna & Tomasz',
    date: '2026-09-05',
    budget: 65000,
    guestsCount: 150,
    venue: 'Pałac Rozalin',
    style: 'Boho',
  },
  {
    id: 'w-3',
    name: 'Aleksandra & Jan',
    date: '2026-10-24',
    budget: 35000,
    guestsCount: 85,
    venue: 'Stodoła Borowo',
    style: 'Rustykalny',
  },
]

const initialState: AuthState = {
  user: null,
  activeWeddingId: null,
  weddings: mockWeddings,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ name: string; email: string; role: 'couple' | 'planner' }>) => {
      state.user = action.payload
      if (action.payload.role === 'couple') {
        // Find if this couple has an active wedding, if not leave null so they can create one
        const coupleWedding = state.weddings.find(w => w.name.includes(action.payload.name))
        state.activeWeddingId = coupleWedding ? coupleWedding.id : null
      } else {
        // Planner has no active wedding by default, must select one
        state.activeWeddingId = null
      }
    },
    logout: (state) => {
      state.user = null
      state.activeWeddingId = null
    },
    registerCouple: (state, action: PayloadAction<{ coupleName: string; email: string; weddingDate: string }>) => {
      state.user = {
        name: action.payload.coupleName,
        email: action.payload.email,
        role: 'couple',
        weddingDate: action.payload.weddingDate
      }
      state.activeWeddingId = null // Starts with no wedding event, will show Create Event screen
    },
    createWedding: (state, action: PayloadAction<Omit<Wedding, 'id'>>) => {
      const newWedding: Wedding = {
        ...action.payload,
        id: `w-${Date.now()}`
      }
      state.weddings.push(newWedding)
      state.activeWeddingId = newWedding.id
    },
    setActiveWeddingId: (state, action: PayloadAction<string | null>) => {
      state.activeWeddingId = action.payload
    }
  }
})

export const { login, logout, registerCouple, createWedding, setActiveWeddingId } = authSlice.actions
export const authReducer = authSlice.reducer
