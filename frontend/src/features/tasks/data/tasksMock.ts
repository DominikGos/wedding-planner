import type { TaskResponse, TaskStatus, TaskType } from '../../../api/taskApi'

export type TaskItem = TaskResponse

export const taskTypes: Array<{ value: TaskType; label: string }> = [
  { value: 'CATERING', label: 'Catering' },
  { value: 'DECORATION', label: 'Dekoracje' },
  { value: 'ENTERTAINMENT', label: 'Rozrywka' },
]

export const taskStatuses: Array<{ value: TaskStatus; label: string }> = [
  { value: 'PENDING', label: 'Do zrobienia' },
  { value: 'IN_PROGRESS', label: 'W trakcie' },
  { value: 'COMPLETED', label: 'Zrobione' },
]
