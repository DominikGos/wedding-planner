import { Outlet } from 'react-router-dom'
import { MainNav } from './MainNav'

export function AppShell() {
  return (
    <div className='app-shell'>
      <header className='app-shell__top'>
        <div className='brand'>WEDDING PLANNER PRO</div>
        <MainNav />
      </header>
      <main className='app-shell__content'>
        <Outlet />
      </main>
    </div>
  )
}
