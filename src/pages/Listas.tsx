import { useEffect, useMemo, useRef, useState } from 'react'
import { API_BASE_URL } from '../api'

type Lista = { id: number; nombre: string }
type Correo = { id: number; email: string }

const API = API_BASE_URL + '/listas'

export default function Listas() {
  const [listas, setListas] = useState<Lista[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)

  // UI: crear lista
  const [nuevoNombre, setNuevoNombre] = useState('')

  // UI: panel de correos de una lista
  const [listaActiva, setListaActiva] = useState<Lista | null>(null)
  const [correos, setCorreos] = useState<Correo[]>([])
  const [loadingCorreos, setLoadingCorreos] = useState(false)
  const [emailNuevo, setEmailNuevo] = useState('')
  const [agregandoEmail, setAgregandoEmail] = useState(false)

  // UI: importar contactos
  const [importando, setImportando] = useState(false)
  const [textoImportar, setTextoImportar] = useState('')
  const [importandoCorreos, setImportandoCorreos] = useState(false)

  const abortRef = useRef<AbortController | null>(null)

  const ordenarListas = useMemo(
    () => (arr: Lista[]) => [...arr].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    []
  )

  useEffect(() => {
    cargarListas()
    return () => abortRef.current?.abort()
  }, [])

  async function cargarListas() {
    setLoading(true)
    setError(null)
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    try {
      const res = await fetch(API, { signal: controller.signal })
      if (!res.ok) throw new Error(await res.text())
      const data: Lista[] = await res.json()
      setListas(ordenarListas(data))
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setError('No se pudieron cargar las listas.')
        console.error(e)
      }
    } finally {
      setLoading(false)
    }
  }

  async function crearLista(e: React.FormEvent) {
    e.preventDefault()
    if (!nuevoNombre.trim()) {
      setError('Ingresá un nombre para la lista.')
      return
    }
    setError(null)
    setCreating(true)
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevoNombre.trim() }),
      })
      if (!res.ok) throw new Error(await res.text())
      setOkMsg('Lista creada.')
      setNuevoNombre('')
      await cargarListas()
    } catch (e: any) {
      console.error(e)
      setError(
        /conflict|existe|duplicate|unique/i.test(e.message)
          ? 'La lista ya existe.'
          : 'Error al crear la lista.'
      )
    } finally {
      setCreating(false)
    }
  }

  async function eliminarLista(id: number) {
    if (!confirm('¿Eliminar esta lista y sus asociaciones?')) return
    setDeleting(id)
    setError(null)
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(await res.text())
      setOkMsg('Lista eliminada.')
      setListas(prev => prev.filter(l => l.id !== id))
      if (listaActiva?.id === id) {
        setListaActiva(null)
        setCorreos([])
      }
    } catch (e) {
      console.error(e)
      setError('Error al eliminar la lista.')
    } finally {
      setDeleting(null)
    }
  }

  async function abrirCorreos(lista: Lista) {
    setListaActiva(lista)
    setCorreos([])
    setLoadingCorreos(true)
    setError(null)
    try {
      const res = await fetch(`${API}/${lista.id}/correos`)
      if (!res.ok) throw new Error(await res.text())
      const data: Correo[] = await res.json()
      setCorreos(data)
    } catch (e) {
      console.error(e)
      setError('No se pudieron obtener los correos de la lista.')
    } finally {
      setLoadingCorreos(false)
    }
  }

  function validarEmail(email: string) {
    // validación simple
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  async function agregarCorreo(e: React.FormEvent) {
    e.preventDefault()
    if (!listaActiva) return
    const email = emailNuevo.trim().toLowerCase()
    if (!validarEmail(email)) {
      setError('Ingresá un correo válido.')
      return
    }
    setAgregandoEmail(true)
    setError(null)
    try {
      const res = await fetch(`${API}/${listaActiva.id}/correos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error(await res.text())

      // actualizar UI (evita duplicados locales)
      setCorreos(prev =>
        prev.some(c => c.email.toLowerCase() === email)
          ? prev
          : [{ id: Date.now(), email }, ...prev]
      )
      setEmailNuevo('')
      setOkMsg('Correo agregado a la lista.')
    } catch (e) {
      console.error(e)
      setError('Error al agregar el correo a la lista.')
    } finally {
      setAgregandoEmail(false)
    }
  }

  async function importarCorreos() {
    if (!listaActiva) return
    // Extraer correos válidos del texto
    const emails = Array.from(
      textoImportar.matchAll(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)
    ).map(m => m[0].toLowerCase())
    if (emails.length === 0) {
      setError('No se encontraron correos válidos en el texto.')
      return
    }
    setImportandoCorreos(true)
    setError(null)
    try {
      const res = await fetch(`${API}/${listaActiva.id}/correos/importar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails }),
      })
      if (!res.ok) throw new Error(await res.text())
      setOkMsg(`Se importaron ${emails.length} correos.`)
      setTextoImportar('')
      setImportando(false)
      await abrirCorreos(listaActiva)
    } catch (e) {
      console.error(e)
      setError('Error al importar los correos.')
    } finally {
      setImportandoCorreos(false)
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h2>Listas</h2>
        <p className="muted">Gestioná tus listas de destinatarios</p>
      </header>

      {/* mensajes */}
      {error && <div className="alert">{error}</div>}
      {okMsg && (
        <div className="alert" style={{ borderColor: 'rgba(75,224,194,.4)', color: '#b9ffef', background: 'rgba(75,224,194,.08)' }}>
          {okMsg}
        </div>
      )}

      {/* crear lista */}
      <section className="panel">
        <div className="panel-head">
          <h3>Nueva lista</h3>
        </div>
        <div className="panel-body">
          <form onSubmit={crearLista} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Nombre de la lista (ej: Clientes 2025)"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              className="input"
              style={{ flex: '1 1 280px' }}
            />
            <button className="btn-primary" disabled={creating}>
              {creating ? 'Creando…' : 'Crear lista'}
            </button>
          </form>
        </div>
      </section>

      {/* listado de listas */}
      <section className="panel">
        <div className="panel-head">
          <h3>Todas las listas</h3>
        </div>
        <div className="panel-body">
          {loading ? (
            <p className="muted">Cargando…</p>
          ) : listas.length === 0 ? (
            <p className="muted">Aún no hay listas. Creá la primera arriba.</p>
          ) : (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))' }}>
              {listas.map((l) => (
                <article key={l.id} className="card" style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <div className="card-label">Lista</div>
                      <div className="card-value" style={{ fontSize: 20 }}>{l.nombre}</div>
                    </div>
                    <button
                      className="btn-ghost"
                      onClick={() => abrirCorreos(l)}
                      style={{ cursor: 'pointer' }}
                    >
                      Ver correos
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn-primary"
                      onClick={() => abrirCorreos(l)}
                    >
                      Gestionar
                    </button>
                    <button
                      className="btn-ghost"
                      onClick={() => eliminarLista(l.id)}
                      disabled={deleting === l.id}
                      style={{ cursor: deleting === l.id ? 'not-allowed' : 'pointer' }}
                    >
                      {deleting === l.id ? 'Eliminando…' : 'Eliminar'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* drawer / modal simple para correos */}
      {listaActiva && (
        <div
          role="dialog"
          aria-modal="true"
          className="login-wrap"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(2px)', zIndex: 100 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setListaActiva(null)
          }}
        >
          <div className="login-card" style={{ maxWidth: 720, width: 'min(96vw, 720px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h3 style={{ margin: 0 }}>Correos en “{listaActiva.nombre}”</h3>
                <p className="muted" style={{ marginTop: 4 }}>
                  Agregá correos; los duplicados se evitan automáticamente.
                </p>
              </div>
              <button className="btn-ghost" onClick={() => setListaActiva(null)} style={{ cursor: 'pointer' }}>
                Cerrar
              </button>
            </div>

            <form onSubmit={agregarCorreo} style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <input
                type="email"
                placeholder="correo@dominio.com"
                value={emailNuevo}
                onChange={(e) => setEmailNuevo(e.target.value)}
                className="input"
                style={{ flex: '1 1 340px' }}
              />
              <button className="btn-primary" disabled={agregandoEmail}>
                {agregandoEmail ? 'Agregando…' : 'Agregar correo'}
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setImportando(true)}
                style={{ marginLeft: 8 }}
              >
                Importar contactos
              </button>
            </form>

            {importando && (
              <div style={{ marginTop: 16, background: '#222', padding: 16, borderRadius: 8 }}>
                <h4>Importar contactos</h4>
                <p className="muted">Pegá cualquier texto, se extraerán los correos válidos.</p>
                <textarea
                  rows={5}
                  style={{ width: '100%', marginBottom: 8 }}
                  value={textoImportar}
                  onChange={e => setTextoImportar(e.target.value)}
                  placeholder="Pegá aquí los correos o texto…"
                  disabled={importandoCorreos}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn-primary"
                    onClick={importarCorreos}
                    disabled={importandoCorreos}
                  >
                    {importandoCorreos ? 'Importando…' : 'Importar'}
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => setImportando(false)}
                    disabled={importandoCorreos}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div style={{ marginTop: 16, borderTop: '1px solid var(--stroke)', paddingTop: 12, maxHeight: '45vh', overflow: 'auto' }}>
              {loadingCorreos ? (
                <p className="muted">Cargando correos…</p>
              ) : correos.length === 0 ? (
                <p className="muted">Esta lista aún no tiene correos.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
                  {correos.map(c => (
                    <li key={`${c.id}-${c.email}`} className="card" style={{ padding: 10 }}>
                      {c.email}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
