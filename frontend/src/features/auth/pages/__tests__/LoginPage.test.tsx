import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { authReducer } from '../../../../store/slices/authSlice'
import { LoginPage } from '../LoginPage'
import '../../../../i18n' // Import initialized i18n instance

// Helper to configure a test store
function getTestStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
  })
}

describe('LoginPage Component', () => {
  it('renders login tab content by default', () => {
    const store = getTestStore()
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login?tab=login']}>
          <LoginPage />
        </MemoryRouter>
      </Provider>
    )

    // Check that title and subtitles are rendered
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Wedding Planner/i)
    
    // Check that login tab form fields are present
    expect(screen.getByPlaceholderText(/maria\.jakub@example\.com|e\.g\., mary\.james@example\.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument()
  })

  it('renders validation error when email is incorrect', async () => {
    const store = getTestStore()
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login?tab=login']}>
          <LoginPage />
        </MemoryRouter>
      </Provider>
    )

    const emailInput = screen.getByPlaceholderText(/maria\.jakub@example\.com|e\.g\., mary\.james@example\.com/i)

    // Input invalid email and submit the form directly to bypass browser validation block
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    const form = emailInput.closest('form')!
    fireEvent.submit(form)

    // Check validation message
    const errorAlert = await screen.findByText(/Wprowadź poprawny adres e-mail\./i)
    expect(errorAlert).toBeInTheDocument()
  })

  it('switches tabs to register when clicking register button', () => {
    const store = getTestStore()
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login?tab=login']}>
          <LoginPage />
        </MemoryRouter>
      </Provider>
    )

    // Find the register tab button and click it
    const registerTabBtn = screen.getByRole('button', { name: /Zarejestruj się|Register/i })
    fireEvent.click(registerTabBtn)

    // Check that register inputs appear
    expect(screen.getByPlaceholderText(/Katarzyna & Tomasz|Katherine & Thomas/i)).toBeInTheDocument()
  })
})
