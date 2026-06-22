import { lazy, Suspense } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../components/common/AppShell'

// Lazy loaded page components
const BudgetPage = lazy(() => import('../features/budget/pages/BudgetPage').then(m => ({ default: m.BudgetPage })))
const CateringPage = lazy(() => import('../features/catering/pages/CateringPage').then(m => ({ default: m.CateringPage })))
const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const EventsPage = lazy(() => import('../features/events/pages/EventsPage').then(m => ({ default: m.EventsPage })))
const GuestsPage = lazy(() => import('../features/guests/pages/GuestsPage').then(m => ({ default: m.GuestsPage })))
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })))
const OAuthSuccessPage = lazy(() => import('../features/auth/pages/OAuthSuccessPage').then(m => ({ default: m.OAuthSuccessPage })))
const TasksPage = lazy(() => import('../features/tasks/pages/TasksPage').then(m => ({ default: m.TasksPage })))
const VendorsPage = lazy(() => import('../features/vendors/pages/VendorsPage').then(m => ({ default: m.VendorsPage })))
const CreateEventPage = lazy(() => import('../features/events/pages/CreateEventPage').then(m => ({ default: m.CreateEventPage })))
const EditEventPage = lazy(() => import('../features/events/pages/EditEventPage').then(m => ({ default: m.EditEventPage })))
const GuestRsvpPage = lazy(() => import('../features/guests/pages/GuestRsvpPage').then(m => ({ default: m.GuestRsvpPage })))
const SettingsPage = lazy(() => import('../features/settings/pages/SettingsPage').then(m => ({ default: m.SettingsPage })))

// Premium loading placeholder for lazy components
function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '350px',
        flexDirection: 'column',
        gap: '1rem',
        color: 'var(--muted)'
      }}>
        <span style={{ fontSize: '2.5rem', animation: 'spin 2s linear infinite' }}>✨</span>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.05em' }}>Trwa wczytywanie...</span>
      </div>
    }>
      <Component />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: withSuspense(LoginPage),
  },
  {
    path: '/auth',
    element: withSuspense(LoginPage),
  },
  {
    path: '/oauth-success',
    element: withSuspense(OAuthSuccessPage),
  },
  {
    path: '/rsvp',
    element: withSuspense(GuestRsvpPage),
  },
  {
    path: '/rsvp/:eventCode/:guestCode',
    element: withSuspense(GuestRsvpPage),
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: withSuspense(DashboardPage),
      },
      {
        path: 'events',
        element: withSuspense(EventsPage),
      },
      {
        path: 'events/new',
        element: withSuspense(CreateEventPage),
      },
      {
        path: 'events/:eventId/edit',
        element: withSuspense(EditEventPage),
      },
      {
        path: 'tasks',
        element: withSuspense(TasksPage),
      },
      {
        path: 'budget',
        element: withSuspense(BudgetPage),
      },
      {
        path: 'catering',
        element: withSuspense(CateringPage),
      },
      {
        path: 'vendors',
        element: withSuspense(VendorsPage),
      },
      {
        path: 'guests',
        element: withSuspense(GuestsPage),
      },
      {
        path: 'settings',
        element: withSuspense(SettingsPage),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to='/' replace />,
  },
])
