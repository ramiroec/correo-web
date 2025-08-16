import { useEffect, useMemo, useRef, useState } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import { API_BASE_URL } from '../api'

type Lista = { id: number; nombre: string }
type Envio = { id?: number; fecha: string; asunto: string; cuerpo: string }

const MAIL_API = `${API_BASE_URL}/correos`      // <--- ajustá este prefijo según dónde montes el router
const LISTAS_API = `${API_BASE_URL}/listas`  // se usa para poblar el selector

export default function Enviar() {
  const [listas, setListas] = useState<Lista[]>([])
  const [listaId, setListaId] = useState<number | ''>('')
  const [asunto, setAsunto] = useState('')
  const [cuerpo, setCuerpo] = useState('<p></p>')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)

  const [historial, setHistorial] = useState<Envio[]>([])
  const [loadingHist, setLoadingHist] = useState(false)

  const [envioStats, setEnvioStats] = useState<any>(null)

  const editorRef = useRef<any>(null)

  const puedeEnviar = useMemo(() => {
    const contenido = editorRef.current?.getContent?.({ format: 'text' })?.trim() || ''
    return !!listaId && asunto.trim().length > 0 && contenido.length > 0 && !enviando
  }, [listaId, asunto, cuerpo, enviando])

  useEffect(() => {
    cargarListas()
    cargarHistorial()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function cargarListas() {
    try {
      const res = await fetch(LISTAS_API)
      if (!res.ok) throw new Error(await res.text())
      const data: Lista[] = await res.json()
      setListas(data)
    } catch (e) {
      console.error(e)
      setError('No se pudieron cargar las listas.')
    }
  }

  async function cargarHistorial() {
    setLoadingHist(true)
    try {
      const res = await fetch(`${MAIL_API}/envios`)
      if (!res.ok) throw new Error(await res.text())
      const data: Envio[] = await res.json()
      setHistorial(data)
    } catch (e) {
      console.error(e)
      setError('No se pudo obtener el historial de envíos.')
    } finally {
      setLoadingHist(false)
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setOkMsg(null)
    setEnvioStats(null)

    if (!listaId) {
      setError('Debés seleccionar una lista.')
      return
    }
    if (!asunto.trim()) {
      setError('Ingresá un asunto.')
      return
    }
    const html = editorRef.current?.getContent?.() || cuerpo
    const textoPlano = editorRef.current?.getContent?.({ format: 'text' })?.trim() || ''
    if (!textoPlano) {
      setError('El cuerpo no puede estar vacío.')
      return
    }

    setEnviando(true)
    try {
      const res = await fetch(`${MAIL_API}/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asunto: asunto.trim(),
          cuerpo: html,
          listaId: Number(listaId),
        }),
      })

      const stats = await res.json()
      if (!res.ok) throw new Error(stats?.mensaje || 'Error al enviar.')

      setEnvioStats(stats)
      setOkMsg(stats.mensaje || 'Envío realizado.')
      setAsunto('')
      setCuerpo('<p></p>')
      editorRef.current?.setContent?.('<p></p>')
      await cargarHistorial()
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'Error al enviar.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h2>Enviar campaña</h2>
        <p className="muted">Redactá el correo, elegí la lista y enviá.</p>
      </header>

      {error && <div className="alert">{error}</div>}
      {okMsg && (
        <div className="alert" style={{ borderColor: 'rgba(75,224,194,.4)', color: '#b9ffef', background: 'rgba(75,224,194,.08)' }}>
          {okMsg}
        </div>
      )}

      {/* Formulario */}
      <section className="panel">
        <div className="panel-head">
          <h3>Nueva campaña</h3>
          <span className="badge">Sólo a una lista</span>
        </div>
        <div className="panel-body">
          {enviando && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
              <div className="loader" style={{
                margin: 'auto',
                width: 64,
                height: 64,
                border: '8px solid #eee',
                borderTop: '8px solid #4fe0c2',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <p className="muted" style={{ marginTop: 16 }}>Enviando correos…</p>
              <style>
                {`@keyframes spin { 0% { transform: rotate(0deg);} 100% {transform: rotate(360deg);} }`}
              </style>
            </div>
          )}

          {!enviando && envioStats && (
            <div style={{
              background: 'rgba(75,224,194,.08)',
              border: '1px solid rgba(75,224,194,.4)',
              borderRadius: 8,
              padding: 20,
              marginBottom: 16,
              color: '#b9ffef'
            }}>
              <h4 style={{ marginTop: 0, color: '#4fe0c2' }}>¡Envío realizado!</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li><b>Asunto:</b> {envioStats.asunto}</li>
                <li><b>Lista ID:</b> {envioStats.listaId}</li>
                <li><b>Destinatarios:</b> {envioStats.destinatarios}</li>
                <li><b>Lotes enviados:</b> {envioStats.lotes}</li>
                <li><b>Duración:</b> {envioStats.duracionSegundos} segundos</li>
                <li><b>Fecha:</b> {new Date(envioStats.fecha).toLocaleString()}</li>
              </ul>
              <div style={{ marginTop: 8, color: '#4fe0c2' }}>{envioStats.mensaje}</div>
            </div>
          )}

          <form onSubmit={onSubmit} style={{ display: enviando ? 'none' : 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 2fr', alignItems: 'center' }}>
              <label className="muted">Lista destino</label>
              <select
                className="input"
                value={listaId}
                onChange={e => setListaId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Seleccionar lista…</option>
                {listas.map(l => (
                  <option key={l.id} value={l.id}>{l.nombre}</option>
                ))}
              </select>

              <label className="muted">Asunto</label>
              <input
                className="input"
                type="text"
                placeholder="Asunto del correo"
                value={asunto}
                onChange={e => setAsunto(e.target.value)}
              />
            </div>

            <div>
              <label className="muted" style={{ display: 'block', marginBottom: 8 }}>Contenido</label>
              <Editor
                apiKey="4dj9zhqglh1bt4sfa92pnu66ex6awqkvysfn4satap0jqxvz"
                onInit={(_, editor) => (editorRef.current = editor)}
                value={cuerpo}
                onEditorChange={(content) => setCuerpo(content)}
                init={{
                  height: 420,
                  menubar: false,
                  branding: false,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                    'preview', 'anchor', 'searchreplace', 'visualblocks',
                    'code', 'fullscreen', 'insertdatetime', 'media', 'table',
                    'help', 'wordcount'
                  ],
                  toolbar:
                    'undo redo | blocks | bold italic underline forecolor | ' +
                    'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | ' +
                    'link image table | removeformat | preview fullscreen',
                  content_style:
                    'body { font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:14px }',
                }}
              />
            </div>

            <div className="actions" style={{ justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary" disabled={!puedeEnviar}>
                {enviando ? 'Enviando…' : 'Enviar a la lista'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Historial */}
      <section className="panel">
        <div className="panel-head">
          <h3>Historial de envíos</h3>
          <button className="btn-ghost" onClick={cargarHistorial} style={{ cursor: 'pointer' }}>
            {loadingHist ? 'Actualizando…' : 'Actualizar'}
          </button>
        </div>
        <div className="panel-body">
          {loadingHist ? (
            <p className="muted">Cargando…</p>
          ) : historial.length === 0 ? (
            <p className="muted">Sin envíos registrados.</p>
          ) : (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))' }}>
              {historial.map((h, i) => (
                <article key={h.id ?? i} className="card" style={{ display: 'grid', gap: 8 }}>
                  <div className="card-label">Fecha</div>
                  <div className="card-value" style={{ fontSize: 16 }}>
                    {new Date(h.fecha).toLocaleString()}
                  </div>
                  <div className="card-label" style={{ marginTop: 6 }}>Asunto</div>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {h.asunto}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
