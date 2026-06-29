import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { authReducer } from '../../../../store/slices/authSlice'
import { CheckoutPage } from '../CheckoutPage'
import '../../../../i18n'

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useLocation: () => ({ state: { paymentId: 1 } }),
    useNavigate: () => vi.fn()
  }
})

// Mock APIs using correct relative path (four parents up from __tests__ folder)
vi.mock('../../../../api/paymentApi', () => ({
  getPaymentById: vi.fn().mockResolvedValue({
    id: 1,
    amount: 1500,
    currency: 'PLN',
    method: 'ONLINE',
    status: 'PENDING',
    vendorId: 10,
    expenseId: 20,
    eventId: 5,
    gatewayPaymentId: 'SANDBOX-PLN-12345',
    createdAt: '2026-06-29T12:00:00Z',
    updatedAt: '2026-06-29T12:00:00Z'
  }),
  confirmOnlinePayment: vi.fn().mockResolvedValue({})
}))

vi.mock('../../../../api/vendorApi', () => ({
  getVendors: vi.fn().mockResolvedValue([
    { id: 10, companyName: 'Best Catering Co.', serviceType: 'CATERING' }
  ])
}))

vi.mock('../../../../api/expenseApi', () => ({
  getExpenses: vi.fn().mockResolvedValue([
    { id: 20, description: 'Wedding catering deposit', amount: 1500 }
  ])
}))

function getTestStore(loggedIn = true) {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: loggedIn ? { email: 'couple@example.com', name: 'Couple User', role: 'couple' as const } : null,
        token: loggedIn ? 'valid-token' : null,
        activeWeddingId: 5,
        weddings: [],
        eventsLoading: false,
        eventsError: null
      }
    }
  })
}

describe('CheckoutPage Component', () => {
  it('renders login prompt when not authenticated', () => {
    const store = getTestStore(false)
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CheckoutPage />
        </MemoryRouter>
      </Provider>
    )

    expect(screen.getByText(/Budżet jest dostępny po zalogowaniu/i)).toBeInTheDocument()
  })

  it('renders mock sandbox simulation when payment is a mock sandbox type', async () => {
    const store = getTestStore(true)
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CheckoutPage />
        </MemoryRouter>
      </Provider>
    )

    const title = await screen.findByText(/Bramka Płatnicza/i)
    expect(title).toBeInTheDocument()
    expect(screen.getByText(/Best Catering Co\./i)).toBeInTheDocument()
    expect(screen.getByText(/Wedding catering deposit/i)).toBeInTheDocument()
    expect(screen.getByText(/Symulacja płatności/i)).toBeInTheDocument()
  })
})
