import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import type { RootState } from '../../../store'
import { getPaymentById, confirmOnlinePayment, type PaymentResponse } from '../../../api/paymentApi'
import { getVendors, type VendorResponse } from '../../../api/vendorApi'
import { getExpenses, type ExpenseResponse } from '../../../api/expenseApi'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null

export function CheckoutPage() {
  const location = useLocation()
  const paymentId = (location.state as { paymentId?: number } | null)?.paymentId
  const { t } = useTranslation()
  const navigate = useNavigate()
  const token = useSelector((state: RootState) => state.auth.token)

  const [payment, setPayment] = useState<PaymentResponse | null>(null)
  const [vendor, setVendor] = useState<VendorResponse | null>(null)
  const [expense, setExpense] = useState<ExpenseResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // If no paymentId in state, redirect immediately — prevents direct URL access
  useEffect(() => {
    if (paymentId === undefined) {
      navigate('/budget', { replace: true })
    }
  }, [paymentId, navigate])

  useEffect(() => {
    if (!token || paymentId === undefined) return

    async function loadData() {
      try {
        setIsLoading(true)
        setError(null)

        // 1. Fetch payment
        const paymentData = await getPaymentById(paymentId!, { token: token ?? undefined })
        setPayment(paymentData)

        // 2. Fetch vendor & expense to resolve names
        const [vendorsData, expensesData] = await Promise.all([
          getVendors({ token: token ?? undefined }),
          paymentData.eventId
            ? getExpenses({ eventId: paymentData.eventId }, { token: token ?? undefined })
            : Promise.resolve([])
        ])

        const matchedVendor = vendorsData.find(v => v.id === paymentData.vendorId)
        const matchedExpense = expensesData.find(e => e.id === paymentData.expenseId)

        if (matchedVendor) setVendor(matchedVendor)
        if (matchedExpense) setExpense(matchedExpense)

      } catch (err) {
        console.error('Failed to load checkout details:', err)
        setError(t('budget.loadError') || 'Nie udało się pobrać szczegółów płatności.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadData()
  }, [paymentId, token, t])

  if (!token) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
        {t('budget.requiresLogin')}
      </div>
    )
  }

  if (isLoading) {
    return (
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
        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t('common.loading')}</span>
      </div>
    )
  }

  if (error || !payment) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', display: 'grid', gap: '1rem' }}>
        <div className='app-alert app-alert-danger'>{error || 'Nie znaleziono płatności.'}</div>
        <button onClick={() => navigate('/budget')} className='button-secondary' style={{ justifySelf: 'center' }}>
          {t('common.back')}
        </button>
      </div>
    )
  }

  const isStripe = payment.gatewayPaymentId &&
    (payment.gatewayPaymentId.startsWith('pi_') || payment.gatewayPaymentId.includes('_secret_'))

  return (
    <div style={{
      maxWidth: '850px',
      margin: '0 auto',
      padding: '1.5rem',
      display: 'grid',
      gap: '1.5rem'
    }}>
      {/* Header */}
      <header>
        <button onClick={() => navigate('/budget')} className='button-secondary' style={{ marginBottom: '1rem' }}>
          ← {t('common.back')}
        </button>
        <h1 className='page-title' style={{ fontSize: '1.75rem', fontFamily: 'Georgia, serif' }}>
          {t('budget.gateway.title')}
        </h1>
        <p className='page-subtitle'>
          {isStripe ? 'Bezpieczna płatność testowa Stripe' : t('budget.gateway.subtitle')}
        </p>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        {/* Left: Summary */}
        <section className='page-card' style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            Podsumowanie płatności
          </h2>
          <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>{t('budget.gateway.serviceLabel')}</span>
              <strong style={{ textAlign: 'right' }}>{expense?.description || `Wydatek #${payment.expenseId}`}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>{t('budget.gateway.vendorLabel')}</span>
              <strong>{vendor?.companyName || `Dostawca #${payment.vendorId}`}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Metoda:</span>
              <span>Online (Sandbox)</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.25rem',
              fontWeight: 800,
              borderTop: '1px dashed var(--border)',
              paddingTop: '0.75rem',
              color: 'var(--primary)',
              marginTop: '0.5rem'
            }}>
              <span>{t('budget.gateway.amountLabel')}</span>
              <span>{payment.amount.toLocaleString()} {payment.currency}</span>
            </div>
          </div>
        </section>

        {/* Right: Checkout integration */}
        <section className='page-card' style={{ padding: '1.5rem' }}>
          {isStripe && stripePromise ? (
            <Elements stripe={stripePromise} options={{ clientSecret: payment.gatewayPaymentId || undefined }}>
              <StripeCheckoutForm payment={payment} />
            </Elements>
          ) : (
            <MockCheckoutForm payment={payment} token={token} />
          )}
        </section>
      </div>
    </div>
  )
}

/* ==========================================================================
   Stripe Checkout Form Component
   ========================================================================== */
interface StripeCheckoutFormProps {
  payment: PaymentResponse
}

function StripeCheckoutForm({ payment }: StripeCheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { t } = useTranslation()

  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/budget`,
        },
      })

      if (error) {
        // Stripe returned a payment error (e.g. insufficient funds, card declined).
        // Show the Stripe error message directly.
        const stripeErrorMsg = error.message || 'Wystąpił nieoczekiwany błąd podczas autoryzacji płatności.'
        setErrorMessage(stripeErrorMsg)
      }
      // If no error and no redirect happened, confirmPayment redirected the browser.
    } catch (err: any) {
      // This catch is only reached on a network/SDK-level failure BEFORE Stripe responded.
      console.error('[Checkout] Stripe SDK error:', err)
      setErrorMessage('Nie udało się nawiązać połączenia ze Stripe. Sprawdź połączenie internetowe i spróbuj ponownie.')
    } finally {
      setIsProcessing(false)
    }
  }


  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
      <h2 style={{ margin: 0, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
        Szczegóły płatności Stripe
      </h2>

      <PaymentElement />

      {errorMessage && (
        <div className='app-alert app-alert-danger' style={{ margin: 0 }}>
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing || !stripe}
        className='button-primary'
        style={{
          width: '100%',
          minHeight: '44px',
          borderRadius: '12px',
          fontWeight: 700,
          cursor: isProcessing ? 'wait' : 'pointer',
          marginTop: '0.5rem'
        }}
      >
        {isProcessing ? t('budget.gateway.authorizing') : `Opłać bezpiecznie (${payment.amount} ${payment.currency})`}
      </button>
    </form>
  )
}

/* ==========================================================================
   Mock Sandbox Checkout Form Component
   ========================================================================== */
interface MockCheckoutFormProps {
  payment: PaymentResponse
  token: string
}

function MockCheckoutForm({ payment, token }: MockCheckoutFormProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleConfirm = async (success: boolean, reason?: string) => {
    setIsProcessing(true)
    setErrorMessage(null)

    try {
      await confirmOnlinePayment(
        payment.id,
        {
          success,
          gatewayPaymentId: payment.gatewayPaymentId,
          ...(reason && { failureReason: reason })
        },
        { token }
      )

      navigate('/budget', {
        state: {
          notificationText: success
            ? t('budget.paymentConfirmed')
            : `${t('budget.history.paymentFailedTitle')}: ${reason || 'Error'}`,
          notificationType: success ? 'success' : 'info'
        }
      })
    } catch (err) {
      console.error(err)
      setErrorMessage(t('budget.actionError') || 'Nie udało się zrealizować płatności.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <h2 style={{ margin: 0, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
        Symulacja płatności (Sandbox)
      </h2>

      <div className='app-alert app-alert-warning' style={{ margin: 0, fontSize: '0.85rem' }}>
        Brak aktywnego podłączenia kluczy Stripe API. Używasz lokalnego symulatora sandbox.
      </div>

      {errorMessage && (
        <div className='app-alert app-alert-danger' style={{ margin: 0 }}>
          {errorMessage}
        </div>
      )}

      <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => handleConfirm(true)}
          className='button-primary'
          style={{
            background: '#35684f',
            color: '#fff',
            minHeight: '44px',
            borderRadius: '12px',
            fontWeight: 700,
            cursor: isProcessing ? 'wait' : 'pointer',
            boxShadow: '0 4px 12px rgba(53, 104, 79, 0.25)'
          }}
        >
          {isProcessing ? t('budget.gateway.authorizing') : t('budget.gateway.successBtn')}
        </button>

        <button
          type="button"
          disabled={isProcessing}
          onClick={() => handleConfirm(false, 'Brak wystarczających środków na koncie')}
          className='button-primary'
          style={{
            background: '#c53030',
            color: '#fff',
            minHeight: '44px',
            borderRadius: '12px',
            fontWeight: 700,
            cursor: isProcessing ? 'wait' : 'pointer',
            boxShadow: '0 4px 12px rgba(197, 48, 48, 0.25)'
          }}
        >
          {isProcessing ? t('budget.gateway.authorizing') : t('budget.gateway.failBtn')}
        </button>
      </div>
    </div>
  )
}
