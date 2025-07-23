import { useState } from 'react';
import api from '../api';
import { Editor } from '@tinymce/tinymce-react'; // <-- Importa TinyMCE

function EnviarCorreo() {
  const [asunto, setAsunto] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const enviar = async () => {
    if (!asunto.trim() || !cuerpo.trim()) return;
    
    setEnviando(true);
    try {
      const res = await api.post('/enviar', { asunto, cuerpo });
      setMensaje(res.data);
      setAsunto('');
      setCuerpo('');
    } catch (err) {
      setMensaje('Error al enviar el correo');
    }
    setEnviando(false);
  };

  const limpiarFormulario = () => {
    setAsunto('');
    setCuerpo('');
    setMensaje('');
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <div className="container">
        <header className="header">
          <h1>Enviar Correo Masivo</h1>
          <button 
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
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
              onChange={(e) => setAsunto(e.target.value)}
              placeholder="Escribe el asunto del correo..."
              disabled={enviando}
            />
          </div>

          <div className="input-group">
            <label className="label">Mensaje</label>
            <Editor
              apiKey="4dj9zhqglh1bt4sfa92pnu66ex6awqkvysfn4satap0jqxvz"
              value={cuerpo}
              onEditorChange={(content) => setCuerpo(content)}
              init={{
                height: 300,
                menubar: false,
                plugins: [
                  'advlist autolink lists link charmap preview anchor',
                  'searchreplace visualblocks code fullscreen',
                  'insertdatetime media table paste code help wordcount',
                  'image' // <-- Agrega el plugin de imagen
                ],
                toolbar:
                  'undo redo | formatselect | bold italic backcolor | image | ' + // <-- Agrega el botón de imagen
                  'alignleft aligncenter alignright alignjustify | ' +
                  'bullist numlist outdent indent | removeformat | help'
              }}
              disabled={enviando}
            />
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
              {enviando ? 'Enviando...' : 'Enviar Correo'}
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