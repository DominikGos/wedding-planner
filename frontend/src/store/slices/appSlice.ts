import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type AppState = {
  activeWeddingId: string | null
}

const initialState: AppState = {
  activeWeddingId: null,
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setActiveWeddingId: (state, action: PayloadAction<string | null>) => {
      state.activeWeddingId = action.payload
    },
  },
})

export const { setActiveWeddingId } = appSlice.actions
export const appReducer = appSlice.reducer
