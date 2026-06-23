import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { authReducer } from '../../../../store/slices/authSlice'
import { vendorsReducer } from '../../../../store/slices/vendorsSlice'
import { VendorsPage } from '../VendorsPage'
import '../../../../i18n' // Import initialized i18n instance

// Mock vendor API
vi.mock('../../../api/vendorApi', () => ({
  getVendors: vi.fn(() => Promise.resolve([])),
  createVendor: vi.fn(() => Promise.resolve({
    id: 99,
    companyName: 'Test Company',
    serviceType: 'Catering',
    contact: 'test@example.com',
    price: 150
  })),
  deleteVendor: vi.fn(() => Promise.resolve())
}))

const mockVendors = [
  {
    id: '1',
    name: 'Elegant catering',
    email: 'catering@elegant.pl',
    category: 'Catering',
    rating: 4.8,
    reviewsCount: 20,
    status: 'confirmed' as const,
    priceFrom: '150 PLN / os.',
    icon: 'catering',
  },
  {
    id: '2',
    name: 'Best DJ Band',
    email: 'dj@bestmusic.pl',
    category: 'Muzyka',
    rating: 4.5,
    reviewsCount: 15,
    status: 'pending' as const,
    priceFrom: '4000 PLN',
    icon: 'music',
  }
]

function getTestStore(loggedIn = true) {
  return configureStore({
    reducer: {
      auth: authReducer,
      vendors: vendorsReducer,
    },
    preloadedState: {
      auth: {
        user: loggedIn ? { email: 'planner@example.com', role: 'planner' } : null,
        token: loggedIn ? 'valid-token' : null,
        activeWeddingId: 1,
        weddings: [],
        eventsLoading: false,
        eventsError: null,
      },
      vendors: {
        items: mockVendors
      }
    }
  })
}

describe('VendorsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page titles and vendors statistics cards', () => {
    const store = getTestStore()
    render(
      <Provider store={store}>
        <VendorsPage />
      </Provider>
    )

    expect(screen.getByRole('heading', { name: /Dostawcy|Vendors/i })).toBeInTheDocument()
    expect(screen.getByText('Elegant catering')).toBeInTheDocument()
    expect(screen.getByText('Best DJ Band')).toBeInTheDocument()

    // Verify stats cards
    expect(screen.getByText(/Wszyscy dostawcy|All vendors/i)).toBeInTheDocument()
    expect(screen.getByText(/Potwierdzeni|Confirmed/i)).toBeInTheDocument()
  })

  it('filters vendors by search text query', () => {
    const store = getTestStore()
    render(
      <Provider store={store}>
        <VendorsPage />
      </Provider>
    )

    const searchInput = screen.getByPlaceholderText(/Szukaj dostawcy|Search vendor/i)
    fireEvent.change(searchInput, { target: { value: 'catering' } })

    // "Elegant catering" is matching, "Best DJ Band" is not
    expect(screen.getByText('Elegant catering')).toBeInTheDocument()
    expect(screen.queryByText('Best DJ Band')).not.toBeInTheDocument()
  })

  it('filters vendors by selecting category from dropdown', async () => {
    const store = getTestStore()
    render(
      <Provider store={store}>
        <VendorsPage />
      </Provider>
    )

    const categorySelect = screen.getAllByRole('combobox')[0] // Category dropdown is the first select
    fireEvent.change(categorySelect, { target: { value: 'Muzyka' } })

    // "Best DJ Band" matches category "Muzyka", "Elegant catering" should be filtered out
    expect(screen.getByText('Best DJ Band')).toBeInTheDocument()
    expect(screen.queryByText('Elegant catering')).not.toBeInTheDocument()
  })

  it('opens and closes the Add Vendor modal dialog', async () => {
    const store = getTestStore()
    render(
      <Provider store={store}>
        <VendorsPage />
      </Provider>
    )

    // Modal is initially not present
    expect(screen.queryByText(/Nowy Dostawca|New Vendor/i)).not.toBeInTheDocument()

    // Click "Add Vendor" button
    const addBtn = screen.getByRole('button', { name: /Dodaj dostawcę|Add Vendor/i })
    fireEvent.click(addBtn)

    // Modal should now be open
    expect(screen.getByText(/Nowy Dostawca|New Vendor/i)).toBeInTheDocument()

    // Click "Cancel" button to close it
    const cancelBtn = screen.getByRole('button', { name: /Anuluj|Cancel/i })
    fireEvent.click(cancelBtn)

    // Modal should be closed
    await waitFor(() => {
      expect(screen.queryByText(/Nowy Dostawca|New Vendor/i)).not.toBeInTheDocument()
    })
  })
})
