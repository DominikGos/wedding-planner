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
  token: string | null
  activeWeddingId: string | null
  weddings: Wedding[]
}

type StoredAuthState = Pick<AuthState, 'user' | 'token' | 'activeWeddingId' | 'weddings'>

const AUTH_STATE_STORAGE_KEY = 'weddingPlannerAuth'
const WEDDING_PLANNER_TOKEN_KEY = 'weddingPlannerToken'
const googleOAuthUser: User = {
  name: 'Użytkownik',
  email: '',
  role: 'couple',
}

function getStoredAuthState(): StoredAuthState | null {
  if (typeof window === 'undefined') return null

  const storedValue = window.localStorage.getItem(AUTH_STATE_STORAGE_KEY)
  if (!storedValue) {
    const storedToken = window.localStorage.getItem(WEDDING_PLANNER_TOKEN_KEY)
    return storedToken
      ? {
          user: googleOAuthUser,
          token: storedToken,
          activeWeddingId: null,
          weddings: mockWeddings,
        }
      : null
  }

  try {
    return JSON.parse(storedValue) as StoredAuthState
  } catch {
    return null
  }
}

function saveAuthState(state: StoredAuthState) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(AUTH_STATE_STORAGE_KEY, JSON.stringify({
    user: state.user,
    token: state.token,
    activeWeddingId: state.activeWeddingId,
    weddings: state.weddings,
  }))

  if (state.token) {
    window.localStorage.setItem(WEDDING_PLANNER_TOKEN_KEY, state.token)
  } else {
    window.localStorage.removeItem(WEDDING_PLANNER_TOKEN_KEY)
  }
}

function clearStoredAuthState() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(AUTH_STATE_STORAGE_KEY)
  window.localStorage.removeItem(WEDDING_PLANNER_TOKEN_KEY)
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

const storedAuthState = getStoredAuthState()

const initialState: AuthState = {
  user: storedAuthState?.user ?? null,
  token: storedAuthState?.token ?? null,
  activeWeddingId: storedAuthState?.activeWeddingId ?? null,
  weddings: storedAuthState?.weddings ?? mockWeddings,
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
      saveAuthState(state)
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.activeWeddingId = null
      clearStoredAuthState()
    },
    oauthLoginSuccess: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token
      if (!state.user) {
        state.user = googleOAuthUser
      }
      saveAuthState(state)
    },
    registerCouple: (state, action: PayloadAction<{ coupleName: string; email: string; weddingDate: string }>) => {
      state.user = {
        name: action.payload.coupleName,
        email: action.payload.email,
        role: 'couple',
        weddingDate: action.payload.weddingDate
      }
      state.activeWeddingId = null // Starts with no wedding event, will show Create Event screen
      saveAuthState(state)
    },
    createWedding: (state, action: PayloadAction<Omit<Wedding, 'id'> & { userName?: string }>) => {
      const { userName, ...weddingData } = action.payload
      const newWedding: Wedding = {
        ...weddingData,
        id: `w-${Date.now()}`
      }
      if (state.user && userName) {
        state.user.name = userName
      }
      state.weddings.push(newWedding)
      state.activeWeddingId = newWedding.id
      saveAuthState(state)
    },
    setActiveWeddingId: (state, action: PayloadAction<string | null>) => {
      state.activeWeddingId = action.payload
      saveAuthState(state)
    }
  }
})

export const { login, logout, oauthLoginSuccess, registerCouple, createWedding, setActiveWeddingId } = authSlice.actions
export const authReducer = authSlice.reducer
