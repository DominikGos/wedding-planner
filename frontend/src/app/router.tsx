import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../components/common/AppShell'
import { BudgetPage } from '../features/budget/pages/BudgetPage'
import { CateringPage } from '../features/catering/pages/CateringPage'
import { DashboardPage } from '../features/dashboard/pages/DashboardPage'
import { EventsPage } from '../features/events/pages/EventsPage'
import { GuestsPage } from '../features/guests/pages/GuestsPage'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { TasksPage } from '../features/tasks/pages/TasksPage'
import { VendorsPage } from '../features/vendors/pages/VendorsPage'
import { CreateEventPage } from '../features/events/pages/CreateEventPage'
import { GuestRsvpPage } from '../features/guests/pages/GuestRsvpPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/auth',
    element: <LoginPage />, // Redesigned unified Auth screen
  },
  {
    path: '/rsvp',
    element: <GuestRsvpPage />, // Standalone public RSVP page for guests
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
        path: 'events/new',
        element: <CreateEventPage />, // Multi-step couple event creator
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
        path: 'catering',
        element: <CateringPage />,
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
