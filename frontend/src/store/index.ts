import { configureStore } from '@reduxjs/toolkit'
import { appReducer } from './slices/appSlice'
import { authReducer } from './slices/authSlice'
import { tasksReducer } from './slices/tasksSlice'
import { vendorsReducer } from './slices/vendorsSlice'
import { guestsReducer } from './slices/guestsSlice'

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    tasks: tasksReducer,
    vendors: vendorsReducer,
    guests: guestsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
