import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { initialTasks } from '../../features/tasks/data/tasksMock'
import type { TaskItem } from '../../features/tasks/data/tasksMock'

interface TasksState {
  items: TaskItem[]
}

const initialState: TasksState = {
  items: initialTasks,
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<TaskItem>) => {
      state.items.unshift(action.payload)
    },
    updateTaskStatus: (state, action: PayloadAction<{ id: string; status: TaskItem['status'] }>) => {
      const task = state.items.find(t => t.id === action.payload.id)
      if (task) {
        task.status = action.payload.status
      }
    },
    toggleTaskChecked: (state, action: PayloadAction<string>) => {
      const task = state.items.find(t => t.id === action.payload)
      if (task) {
        task.checked = !task.checked
      }
    },
    editTask: (state, action: PayloadAction<TaskItem>) => {
      const idx = state.items.findIndex(t => t.id === action.payload.id)
      if (idx !== -1) {
        state.items[idx] = action.payload
      }
    }
  }
})

export const { addTask, updateTaskStatus, toggleTaskChecked, editTask } = tasksSlice.actions
export const tasksReducer = tasksSlice.reducer
