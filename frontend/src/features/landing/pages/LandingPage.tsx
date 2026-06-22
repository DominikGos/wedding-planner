import { Link, useSearchParams } from 'react-router-dom'

export function LandingPage() {
  const [searchParams] = useSearchParams()
  const currentTab = searchParams.get('tab') || 'about'

  return (
    <div className='public-page' style={{ display: 'grid', gap: '2.5rem' }}>
      <section style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #fffcf6 0%, #f7f1e5 50%, #efe7dc 100%)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '3rem', opacity: 0.1 }}>🌸</div>
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '3rem', opacity: 0.1 }}>🌸</div>

        <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--primary)', fontWeight: 600 }}>
          Witaj w Wedding Planner
        </span>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '3rem',
          margin: '0.75rem 0',
          fontWeight: 400,
          lineHeight: 1.2,
          color: 'var(--text)'
        }}>
          Planuj Swój Wymarzony Ślub <br />z Lekkością i Klasą
        </h1>
        <p style={{ maxWidth: '600px', margin: '1rem auto 2rem', color: 'var(--muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
          Interaktywne zarządzanie gośćmi, budżetem, dostawcami oraz cateringiem w jednym, luksusowym i intuicyjnym systemie.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/auth" style={{
            padding: '0.8rem 2rem',
            borderRadius: '999px',
            background: 'var(--primary)',
            color: 'var(--on-primary)',
            fontWeight: 600,
            boxShadow: '0 6px 20px rgba(184, 90, 31, 0.2)'
          }}>
            Rozpocznij Bezpłatnie
          </Link>
          <Link to="/rsvp" style={{
            padding: '0.8rem 2rem',
            borderRadius: '999px',
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            fontWeight: 600
          }}>
            Potwierdź RSVP Gościa
          </Link>
        </div>
      </section>

      <section className="page-card" style={{ padding: '2.5rem' }}>
        {currentTab === 'about' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            <div>
              <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>O Aplikacji</span>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2rem', margin: '0.5rem 0 1rem', fontWeight: 400 }}>Kim Jesteśmy?</h2>
              <p style={{ color: 'var(--muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                Wedding Planner to ekskluzywne oprogramowanie stworzone z myślą o parach młodych oraz profesjonalnych konsultantach ślubnych (Wedding Planners).
                Rozumiemy, że organizacja ślubu wymaga dbałości o każdy, nawet najmniejszy detal.
              </p>
              <p style={{ color: 'var(--muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                Nasz system gromadzi wszystkie kluczowe elementy – harmonogramy, budżet ślubny, zadania, catering oraz listę gości – w jednym spójnym interfejsie klasy Premium.
              </p>
            </div>
            <div style={{ background: 'var(--bg-accent)', padding: '2rem', borderRadius: '16px', border: '1px dashed var(--border)' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontFamily: 'Georgia, serif', fontWeight: 500 }}>Dlaczego nasz system?</h3>
              <ul style={{ paddingLeft: '1.2rem', display: 'grid', gap: '0.75rem', color: 'var(--text)', fontSize: '0.9rem' }}>
                <li>✨ <strong>Elegancja i Styl:</strong> Przepiękny interfejs ułatwiający planowanie.</li>
                <li>📊 <strong>Pełna Kontrola Budżetu:</strong> Śledzenie zaliczek, płatności i faktur dostawców.</li>
                <li>👥 <strong>RSVP Online:</strong> Bezpośrednia integracja odpowiedzi gości z Twoją listą.</li>
                <li>💼 <strong>Dla Profesjonalistów:</strong> Dedykowany pulpit do zarządzania wieloma weselami na raz.</li>
              </ul>
            </div>
          </div>
        )}

        {currentTab === 'services' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Funkcjonalności</span>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2rem', margin: '0.5rem 0 0.5rem', fontWeight: 400 }}>Nasza Oferta Premium</h2>
              <p style={{ color: 'var(--muted)', margin: 0 }}>Poznaj narzędzia, które zaoszczędzą Ci setki godzin stresu.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              <div style={{ border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '12px', background: 'var(--surface)' }}>
                <span style={{ fontSize: '2rem' }}>📅</span>
                <h3 style={{ margin: '0.75rem 0 0.5rem', fontSize: '1.15rem' }}>Interaktywny Harmonogram</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>Planuj kamienie milowe, twórz listy zadań i przypomnienia, które ułatwią terminową realizację.</p>
              </div>
              <div style={{ border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '12px', background: 'var(--surface)' }}>
                <span style={{ fontSize: '2rem' }}>💰</span>
                <h3 style={{ margin: '0.75rem 0 0.5rem', fontSize: '1.15rem' }}>Inteligentny Budżet</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>Automatyczne podsumowania opłat, kontrola zaległych płatności oraz faktur dla wszystkich usługodawców.</p>
              </div>
              <div style={{ border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '12px', background: 'var(--surface)' }}>
                <span style={{ fontSize: '2rem' }}>🍷</span>
                <h3 style={{ margin: '0.75rem 0 0.5rem', fontSize: '1.15rem' }}>Goście i RSVP</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>Zarządzanie stolikami, menu weselnym, alergiami i bezpośredni publiczny panel RSVP dla Twoich gości.</p>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'gallery' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Inspiracje</span>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2rem', margin: '0.5rem 0 0.5rem', fontWeight: 400 }}>Najpiękniejsze Realizacje</h2>
              <p style={{ color: 'var(--muted)', margin: 0 }}>Przegląd stylów weselnych zrealizowanych za pomocą naszego planera.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {[
                { name: 'Wesele Rustykalne w Stodole', style: 'Rustykalny', icon: '🪵' },
                { name: 'Ślub Glamour w Złotym Dworze', style: 'Glamour', icon: '✨' },
                { name: 'Letnie Przyjęcie Boho w Ogrodzie', style: 'Boho', icon: '🌾' },
                { name: 'Klasyczna Elegancja w Pałacu', style: 'Klasyczny', icon: '🌹' }
              ].map((item, idx) => (
                <div key={idx} style={{
                  padding: '2rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                  background: 'linear-gradient(to bottom, var(--surface), var(--surface-soft))',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '2.5rem' }}>{item.icon}</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text)' }}>{item.name}</strong>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '20px', background: 'var(--primary-soft)', color: 'var(--primary)', fontWeight: 600 }}>{item.style}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'contact' && (
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Kontakt</span>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2rem', margin: '0.5rem 0 0.5rem', fontWeight: 400 }}>Porozmawiajmy o Twoim Ślubie</h2>
              <p style={{ color: 'var(--muted)', margin: 0 }}>Masz pytania dotyczące planera lub oferty dla plannera? Napisz do nas!</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); alert('Dziękujemy! Skontaktujemy się wkrótce.'); }} style={{ display: 'grid', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Twoje Imię"
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
              />
              <input
                type="email"
                placeholder="Adres E-mail"
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
              />
              <textarea
                rows={4}
                placeholder="Treść Twojej wiadomości..."
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', resize: 'vertical' }}
              />
              <button type="submit" style={{ padding: '0.8rem', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 600, cursor: 'pointer' }}>
                Wyślij Wiadomość
              </button>
            </form>
          </div>
        )}
      </section>
    </div>
  )
}
