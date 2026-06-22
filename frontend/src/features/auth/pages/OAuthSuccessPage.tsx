import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { oauthLoginSuccess } from '../../../store/slices/authSlice'
import { setTasks } from '../../../store/slices/tasksSlice'

export function OAuthSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) return

    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as { sub: string }
    dispatch(setTasks([]))
    dispatch(oauthLoginSuccess({ token, email: payload.sub }))
    navigate('/', { replace: true })
  }, [dispatch, navigate, token])

  if (!token) {
    return (
      <div className='public-page' style={{ maxWidth: '480px', margin: '3rem auto', padding: '1rem' }}>
        <div className="page-card" style={{ textAlign: 'center' }}>
          <h1 className="page-title">Nie udało się zalogować</h1>
          <p className="page-subtitle">
            Backend nie przekazał tokena logowania. Spróbuj ponownie.
          </p>
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              marginTop: '1.5rem',
              justifyContent: 'center',
              padding: '0.8rem 1.2rem',
              borderRadius: '10px',
              background: 'var(--primary)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(184, 90, 31, 0.15)'
            }}
          >
            Wróć do logowania
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='public-page' style={{ maxWidth: '480px', margin: '3rem auto', padding: '1rem', textAlign: 'center', color: 'var(--muted)' }}>
      Trwa logowanie...
    </div>
  )
}
