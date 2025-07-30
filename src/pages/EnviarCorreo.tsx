import { useState, useRef, useEffect } from 'react';
import api from '../api';
import { Editor } from '@tinymce/tinymce-react';

interface ProgressState {
  current: number;
  total: number;
  batch: number;
}

interface BlobInfo {
  filename: () => string;
  blob: () => Blob;
}

function EnviarCorreo() {
  const [asunto, setAsunto] = useState<string>('');
  const [cuerpo, setCuerpo] = useState<string>('');
  const [mensaje, setMensaje] = useState<string>('');
  const [enviando, setEnviando] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [progress, setProgress] = useState<ProgressState>({ 
    current: 0, 
    total: 0, 
    batch: 0 
  });
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
  };

  // Auto-scroll para los logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const enviar = async () => {
    if (!asunto.trim() || !cuerpo.trim()) return;

    setEnviando(true);
    setProgress({ current: 0, total: 0, batch: 0 });
    setLogs([]);
    addLog('Iniciando envío masivo...');
    
    try {
      // Primero obtenemos el total de correos
      const countRes = await api.get<{ count: number }>('/correos/count');
      const totalEmails = countRes.data.count;
      addLog(`Total de destinatarios: ${totalEmails}`);
      setProgress(prev => ({ ...prev, total: totalEmails }));

      // Luego iniciamos el envío
      const res = await api.post('/enviar', { 
        asunto, 
        cuerpo 
      }, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.progress) {
            const current = Math.round(progressEvent.progress * totalEmails);
            setProgress(prev => ({ 
              ...prev, 
              current: Math.min(current, totalEmails),
              batch: Math.floor(current / 50) + 1
            }));
          }
        }
      });

      addLog('Envío completado con éxito');
      setMensaje(res.data);
      setAsunto('');
      setCuerpo('');
    } catch (err: unknown) {
      let errorMessage = 'Error desconocido';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      addLog(`Error: ${errorMessage}`);
      console.error('❌ Error al enviar el correo:', err);
      setMensaje('Error al enviar el correo');
    } finally {
      setEnviando(false);
    }
  };

  const limpiarFormulario = () => {
    addLog('Limpiando formulario');
    setAsunto('');
    setCuerpo('');
    setMensaje('');
    setLogs([]);
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <div className="container">
        <header className="header">
          <h1>Enviar Correo Masivo</h1>
          <button 
            className="theme-toggle"
            onClick={() => {
              addLog(`Cambiando a modo ${!darkMode ? 'oscuro' : 'claro'}`);
              setDarkMode(!darkMode);
            }}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </header>

        <div className="form-section">
          <div className="input-group">
            <label className="label">Asunto</label>
            <input
              className="input"
              value={asunto}
              onChange={(e) => {
                setAsunto(e.target.value);
                addLog(`Asunto actualizado: ${e.target.value.substring(0, 20)}...`);
              }}
              placeholder="Escribe el asunto del correo..."
              disabled={enviando}
            />
          </div>

          <div className="input-group">
            <label className="label">Mensaje</label>
            <Editor
              apiKey="4dj9zhqglh1bt4sfa92pnu66ex6awqkvysfn4satap0jqxvz"
              value={cuerpo}
              onEditorChange={(content: string) => {
                setCuerpo(content);
                addLog(`Cuerpo del mensaje actualizado (${content.length} caracteres)`);
              }}
              init={{
                height: 300,
                menubar: false,
                plugins: [
                  'advlist autolink lists link charmap preview anchor',
                  'searchreplace visualblocks code fullscreen',
                  'insertdatetime media table paste code help wordcount',
                  'image'
                ],
                toolbar:
                  'undo redo | formatselect | bold italic backcolor | image | ' +
                  'alignleft aligncenter alignright alignjustify | ' +
                  'bullist numlist outdent indent | removeformat | help',
                images_upload_handler: async (blobInfo: BlobInfo) => {
                  addLog(`Subiendo imagen: ${blobInfo.filename()}`);
                  const formData = new FormData();
                  formData.append('image', blobInfo.blob(), blobInfo.filename());
                  try {
                    const res = await api.post<{ location: string }>('/upload', formData, {
                      headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    addLog(`Imagen subida correctamente`);
                    return res.data.location;
                  } catch (err: unknown) {
                    let errorMessage = 'Error desconocido al subir imagen';
                    if (err instanceof Error) {
                      errorMessage = err.message;
                    }
                    addLog(`Error al subir imagen: ${errorMessage}`);
                    throw err;
                  }
                }
              }}
              disabled={enviando}
            />
          </div>

          {/* Sección de progreso */}
          {enviando && (
            <div className="progress-section">
              <div className="progress-info">
                <span>Progreso: {progress.current} de {progress.total}</span>
                <span>Lote actual: {progress.batch}</span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Consola de logs */}
          <div className="logs-container">
            <div className="logs-header">
              <h3>Registro de actividad</h3>
              <button 
                onClick={() => setLogs([])} 
                className="btn small"
                disabled={logs.length === 0}
              >
                Limpiar
              </button>
            </div>
            <div className="logs-content">
              {logs.length === 0 ? (
                <div className="log-empty">No hay actividad registrada</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="log-entry">{log}</div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>

          <div className="form-actions">
            <button 
              className="btn secondary" 
              onClick={limpiarFormulario}
              disabled={enviando || (!asunto && !cuerpo)}
            >
              Limpiar
            </button>
            <button 
              className="btn primary" 
              onClick={enviar}
              disabled={!asunto.trim() || !cuerpo.trim() || enviando}
            >
              {enviando ? (
                <>
                  <span className="spinner"></span>
                  Enviando...
                </>
              ) : 'Enviar Correo'}
            </button>
          </div>

          {mensaje && (
            <div className={`message ${mensaje.includes('Error') ? 'error' : 'success'}`}>
              {mensaje}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EnviarCorreo;