import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface Wedding {
  id: number
  name: string
  date: string
  venue: string
  status: string
  eventCode: string
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
  activeWeddingId: number | null
  weddings: Wedding[]
  eventsLoading: boolean
  eventsError: string | null
}

type StoredAuthState = Pick<AuthState, 'user' | 'token' | 'activeWeddingId'>

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

const storedAuthState = getStoredAuthState()
const storedActiveWeddingId = storedAuthState?.activeWeddingId

const initialState: AuthState = {
  user: storedAuthState?.user ?? null,
  token: storedAuthState?.token ?? null,
  activeWeddingId: typeof storedActiveWeddingId === 'number' ? storedActiveWeddingId : null,
  weddings: [],
  eventsLoading: false,
  eventsError: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ name: string; email: string; role: 'couple' | 'planner' }>) => {
      state.user = action.payload
      state.token = null
      state.activeWeddingId = null
      state.weddings = []
      state.eventsLoading = false
      state.eventsError = null
      saveAuthState(state)
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.activeWeddingId = null
      state.weddings = []
      state.eventsLoading = false
      state.eventsError = null
      clearStoredAuthState()
    },
    oauthLoginSuccess: (state, action: PayloadAction<{ token: string; email: string; role: 'couple' | 'planner' }>) => {
      state.token = action.payload.token
      state.activeWeddingId = null
      state.weddings = []
      state.eventsLoading = false
      state.eventsError = null
      state.user = {
        name: 'Użytkownik',
        email: action.payload.email,
        role: action.payload.role, // dynamiczna rola przekazana z tokena
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
      state.token = null
      state.activeWeddingId = null
      state.weddings = []
      state.eventsLoading = false
      state.eventsError = null
      saveAuthState(state)
    },
    localAuthSuccess: (state, action: PayloadAction<{ token: string; email: string; role: 'couple' | 'planner'; name: string; weddingDate?: string }>) => {
      state.token = action.payload.token
      state.activeWeddingId = null
      state.weddings = []
      state.eventsLoading = false
      state.eventsError = null
      state.user = {
        name: action.payload.name,
        email: action.payload.email,
        role: action.payload.role,
        weddingDate: action.payload.weddingDate
      }
      saveAuthState(state)
    },
    setEventsLoading: (state) => {
      state.eventsLoading = true
      state.eventsError = null
    },
    setEvents: (state, action: PayloadAction<Wedding[]>) => {
      state.weddings = action.payload
      state.eventsLoading = false
      state.eventsError = null

      const activeEventExists = state.weddings.some(wedding => wedding.id === state.activeWeddingId)
      if (!activeEventExists) {
        state.activeWeddingId = state.user?.role === 'couple' && state.weddings.length > 0
          ? state.weddings[0].id
          : null
      }
      saveAuthState(state)
    },
    setEventsError: (state, action: PayloadAction<string>) => {
      state.eventsLoading = false
      state.eventsError = action.payload
    },
    setActiveWeddingId: (state, action: PayloadAction<number | null>) => {
      state.activeWeddingId = action.payload
      saveAuthState(state)
    }
  }
})

export const {
  login,
  logout,
  oauthLoginSuccess,
  registerCouple,
  localAuthSuccess,
  setEventsLoading,
  setEvents,
  setEventsError,
  setActiveWeddingId,
} = authSlice.actions
export const authReducer = authSlice.reducer
