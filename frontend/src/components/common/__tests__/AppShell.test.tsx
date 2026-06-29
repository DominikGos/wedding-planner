import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { authReducer } from '../../../store/slices/authSlice'
import { AppShell } from '../AppShell'
import '../../../i18n' // Import initialized i18n instance

// Helper to configure a test store
function getTestStore(initialState = {}) {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        activeWeddingId: null,
        weddings: [],
        eventsLoading: false,
        eventsError: null,
        ...initialState,
      },
    },
  })
}

describe('AppShell Component', () => {
  it('renders header brand and public auth links for guest users', () => {
    const store = getTestStore()
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AppShell />
        </MemoryRouter>
      </Provider>
    )

    // Check brand name is displayed
    expect(screen.getAllByText(/WEDDING PLANNER/i)[0]).toBeInTheDocument()

    // Check separate login/register buttons exist for guest
    expect(screen.getByRole('link', { name: /Zaloguj się|Log In/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Zarejestruj się|Register/i })).toBeInTheDocument()
  })

  it('toggles the application theme when toggle button is clicked', () => {
    const store = getTestStore()
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AppShell />
        </MemoryRouter>
      </Provider>
    )

    const themeToggleBtn = screen.getByTitle(/Przełącz motyw|Motyw strony/i)
    expect(themeToggleBtn).toBeInTheDocument()

    // Trigger theme toggle
    fireEvent.click(themeToggleBtn)
    
    // Check if the localStorage was updated
    expect(localStorage.getItem('theme')).toMatch(/dark|light/)
  })

  it('toggles language when language button is clicked', () => {
    const store = getTestStore()
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AppShell />
        </MemoryRouter>
      </Provider>
    )

    const langToggleBtn = screen.getByTitle(/Zmień język|Język strony/i)
    expect(langToggleBtn).toBeInTheDocument()

    const initialLangBtnText = langToggleBtn.textContent // e.g. "🇬🇧 EN" or "🇵🇱 PL"
    
    // Toggle language
    fireEvent.click(langToggleBtn)

    // Check that button text toggled to the other language label
    expect(langToggleBtn.textContent).not.toBe(initialLangBtnText)
  })
})
