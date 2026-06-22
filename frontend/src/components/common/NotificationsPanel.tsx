import { useEffect, useRef, useState } from 'react'
import { getNotifications, markNotificationAsRead, type NotificationResponse } from '../../api/notificationApi'

type NotificationsPanelProps = {
  token: string | null
}

function formatMessage(message: string) {
  const statusChanged = message.match(/^Status zadania "(.+)" zmieniono z (PENDING|IN_PROGRESS|COMPLETED) na (PENDING|IN_PROGRESS|COMPLETED)$/)
  const labels = {
    PENDING: 'Do zrobienia',
    IN_PROGRESS: 'W trakcie',
    COMPLETED: 'Zrobione',
  }

  if (statusChanged) {
    return `Zmieniono status zadania „${statusChanged[1]}”: ${labels[statusChanged[2] as keyof typeof labels]} → ${labels[statusChanged[3] as keyof typeof labels]}`
  }

  return message
    .replaceAll('PENDING', labels.PENDING)
    .replaceAll('IN_PROGRESS', labels.IN_PROGRESS)
    .replaceAll('COMPLETED', labels.COMPLETED)
    .replaceAll(' -> ', ' → ')
}

export function NotificationsPanel({ token }: NotificationsPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [open, setOpen] = useState(false)
  const [loadedToken, setLoadedToken] = useState<string | null>(null)
  const [unreadBeforeOpen, setUnreadBeforeOpen] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const loading = Boolean(token && loadedToken !== token)

  useEffect(() => {
    if (!token) return

    const refreshNotifications = () => {
      getNotifications({ token })
        .then(items => {
          setNotifications(items)
          setError(null)
        })
        .catch(() => setError('Nie udało się pobrać powiadomień.'))
        .finally(() => setLoadedToken(token))
    }

    refreshNotifications()
    window.addEventListener('notifications:refresh', refreshNotifications)
    return () => window.removeEventListener('notifications:refresh', refreshNotifications)
  }, [token])

  useEffect(() => {
    if (!open) return

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [open])

  const togglePanel = async () => {
    if (open) {
      setOpen(false)
      return
    }

    setOpen(true)
    if (!token) return
    setLoadedToken(null)

    try {
      const items = await getNotifications({ token })
      const unread = items.filter(notification => !notification.isRead)
      setUnreadBeforeOpen(unread.map(notification => notification.id))
      setNotifications(items)
      setError(null)

      if (unread.length > 0) {
        const updated = await Promise.all(unread.map(notification => markNotificationAsRead(notification.id, { token })))
        setNotifications(current => current.map(notification => updated.find(item => item.id === notification.id) ?? notification))
      }
    } catch {
      setError('Nie udało się pobrać lub oznaczyć powiadomień jako przeczytane.')
    } finally {
      setLoadedToken(token)
    }
  }

  const unreadCount = token && loadedToken === token
    ? notifications.filter(notification => !notification.isRead).length
    : 0

  return (
    <div ref={containerRef} className='notifications-panel' style={{ position: 'relative' }}>
      <button type='button' className={unreadCount > 0 ? 'button-primary' : 'button-secondary'} onClick={() => void togglePanel()} style={{ minHeight: '38px', padding: '0.4rem 0.75rem' }}>
        Powiadomienia{unreadCount > 0 ? ` (${unreadCount})` : ''}
      </button>

      {open && (
        <section className='page-card notifications-dropdown' style={{ position: 'absolute', top: 'calc(100% + 0.6rem)', right: 0, width: 'min(380px, calc(100vw - 2rem))', padding: '1rem', display: 'grid', gap: '0.75rem', zIndex: 110 }}>
          <strong>Powiadomienia</strong>
          {!token && <span style={{ color: 'var(--muted)' }}>Powiadomienia są dostępne po zalogowaniu przez Google.</span>}
          {token && loading && <span style={{ color: 'var(--muted)' }}>Ładowanie powiadomień...</span>}
          {error && <span style={{ color: '#c53030' }}>{error}</span>}
          {token && !loading && !error && notifications.length === 0 && <span style={{ color: 'var(--muted)' }}>Brak powiadomień.</span>}

          {token && !loading && notifications.length > 0 && (
            <div style={{ maxHeight: '330px', overflowY: 'auto', display: 'grid', gap: '0.75rem', paddingRight: '0.25rem' }}>
              {notifications.map(notification => (
                <div key={notification.id} style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', background: unreadBeforeOpen.includes(notification.id) ? 'var(--primary-soft)' : 'var(--surface)', display: 'grid', gap: '0.45rem' }}>
                  <span style={{ whiteSpace: 'normal', lineHeight: 1.4 }}>{formatMessage(notification.message)}</span>
                  <small style={{ color: 'var(--muted)' }}>{new Date(notification.createdAt).toLocaleString('pl-PL')}</small>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
