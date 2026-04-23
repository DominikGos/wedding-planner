export function DashboardPage() {
  return (
    <section className='page-card'>
      <h1 className='page-title'>Panel przygotowan slubu</h1>
      <p className='page-subtitle'>
        Jedno miejsce do monitorowania postepu, budzetu i ryzyk terminowych dla Pary Mlodej i Wedding Plannera.
      </p>

      <div className='stats-grid'>
        <article className='stat-item'>
          <span>Termin slubu</span>
          <strong>14.09.2027</strong>
        </article>
        <article className='stat-item'>
          <span>Zadania zakonczone</span>
          <strong>31 / 48</strong>
        </article>
        <article className='stat-item'>
          <span>Budzet wykorzystany</span>
          <strong>62%</strong>
        </article>
        <article className='stat-item'>
          <span>Potwierdzeni goscie</span>
          <strong>96 / 120</strong>
        </article>
      </div>

      <p className='hint'>
        To szkic widoku biznesowego. Docelowo dane beda pobierane z backendu i aktualizowane w czasie rzeczywistym dla calego zespolu.
      </p>
    </section>
  )
}
