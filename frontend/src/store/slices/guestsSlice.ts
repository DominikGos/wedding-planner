import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { initialGuests } from '../../features/guests/data/guestsMock'
import type { Guest, GuestStatus } from '../../features/guests/data/guestsMock'

interface GuestsState {
  items: Guest[]
}

const initialState: GuestsState = {
  items: initialGuests,
}

const guestsSlice = createSlice({
  name: 'guests',
  initialState,
  reducers: {
    addGuest: (state, action: PayloadAction<Guest>) => {
      state.items.unshift(action.payload)
    },
    updateGuest: (state, action: PayloadAction<Guest>) => {
      const idx = state.items.findIndex(g => g.id === action.payload.id)
      if (idx !== -1) {
        state.items[idx] = action.payload
      }
    },
    deleteGuest: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(g => g.id !== action.payload)
    },
    updateGuestStatus: (state, action: PayloadAction<{ id: string; status: GuestStatus }>) => {
      const guest = state.items.find(g => g.id === action.payload.id)
      if (guest) {
        guest.status = action.payload.status
      }
    }
  }
})

export const { addGuest, updateGuest, deleteGuest, updateGuestStatus } = guestsSlice.actions
export const guestsReducer = guestsSlice.reducer
