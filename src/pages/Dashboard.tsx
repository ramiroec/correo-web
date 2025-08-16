import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type Stat = { label: string; value: string; hint?: string }

export default function Dashboard() {
  const [stats, setStats] = useState<Stat[]>([])

  useEffect(() => {
    // datos ficticios iniciales (luego conectarás con tu API)
    setStats([
      { label: 'Contactos totales', value: '12,340' },
      { label: 'Listas activas', value: '8' },
      { label: 'Campañas enviadas', value: '42', hint: 'Últimos 30 días' },
      { label: 'Tasa promedio de apertura', value: '38.5%' },
    ])
  }, [])

  const navigate = useNavigate()
  const handleCrearCampaña = () => {
    navigate('/enviar') // 👈 Redirigir al hacer clic
  }

  return (
    <div className="page">
      <header className="page-header">
        <h2>Dashboard</h2>
        <p className="muted">Resumen de tu envío masivo de correos</p>
      </header>

      <section className="grid">
        {stats.map((s) => (
          <article key={s.label} className="card">
            <div className="card-label">{s.label}</div>
            <div className="card-value">{s.value}</div>
            {s.hint && <div className="card-hint">{s.hint}</div>}
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Enviar campaña rápida</h3>
          <span className="badge">Demo</span>
        </div>
        <div className="panel-body">
          <p className="muted">
            Esta es una vista previa. Aquí podrás seleccionar una lista, redactar el asunto,
            el contenido y programar el envío.
          </p>
          <div className="actions">
            <button className="btn-primary" onClick={handleCrearCampaña}>Crear campaña</button>
            <button className="btn-ghost" disabled>Importar contactos</button>
          </div>
        </div>
      </section>
    </div>
  )
}
