import { Link } from 'react-router-dom'

export function LoginPage() {
  return (
    <section className='page-card'>
      <h1 className='page-title'>Logowanie</h1>
      <p className='page-subtitle'>
        Dostep role-based dla Pary Mlodej i Wedding Plannera bedzie oparty o token JWT.
      </p>
      <p className='hint'>
        Endpoint autoryzacji jest przygotowany w warstwie api. Wroc do <Link to='/'>panelu</Link>.
      </p>
    </section>
  )
}
