import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../components/common/AppShell'
import { BudgetPage } from '../features/budget/pages/BudgetPage'
import { DashboardPage } from '../features/dashboard/pages/DashboardPage'
import { EventsPage } from '../features/events/pages/EventsPage'
import { GuestsPage } from '../features/guests/pages/GuestsPage'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { TasksPage } from '../features/tasks/pages/TasksPage'
import { VendorsPage } from '../features/vendors/pages/VendorsPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'events',
        element: <EventsPage />,
      },
      {
        path: 'tasks',
        element: <TasksPage />,
      },
      {
        path: 'budget',
        element: <BudgetPage />,
      },
      {
        path: 'vendors',
        element: <VendorsPage />,
      },
      {
        path: 'guests',
        element: <GuestsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to='/' replace />,
  },
])
