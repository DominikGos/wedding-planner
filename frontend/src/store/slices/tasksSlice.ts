import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { TaskItem } from '../../features/tasks/data/tasksMock'

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: { items: [] as TaskItem[] },
  reducers: {
    setTasks: (state, action: PayloadAction<TaskItem[]>) => {
      state.items = action.payload
    },
  },
})

export const { setTasks } = tasksSlice.actions
export const tasksReducer = tasksSlice.reducer
