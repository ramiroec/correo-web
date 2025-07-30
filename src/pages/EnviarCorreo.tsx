import { useState } from 'react';
import api from '../api';
import { Editor } from '@tinymce/tinymce-react';

function EnviarCorreo() {
  const [asunto, setAsunto] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const enviar = async () => {
    if (!asunto.trim() || !cuerpo.trim()) return;

    setEnviando(true);
    console.log('📨 Enviando correo:', { asunto, cuerpo });
    try {
      const res = await api.post('/enviar', { asunto, cuerpo });
      console.log('✅ Respuesta del backend:', res.data);
      setMensaje(res.data);
      setAsunto('');
      setCuerpo('');
    } catch (err) {
      console.error('❌ Error al enviar el correo:', err);
      setMensaje('Error al enviar el correo');
    }
    setEnviando(false);
  };

  const limpiarFormulario = () => {
    console.log('🧹 Limpiando formulario');
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
            onClick={() => {
              console.log('🌗 Cambiando modo:', !darkMode ? 'dark' : 'light');
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
                console.log('✏️ Asunto cambiado:', e.target.value);
                setAsunto(e.target.value);
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
              onEditorChange={(content) => {
                console.log('📝 Contenido del editor cambiado:', content);
                setCuerpo(content);
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
                images_upload_handler: async (blobInfo: any) => {
                  console.log('📤 Subiendo imagen:', blobInfo.filename());
                  const formData = new FormData();
                  formData.append('image', blobInfo.blob(), blobInfo.filename());
                  const res = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                  });
                  const data = res.data;
                  if (data.location) {
                    console.log('✅ Imagen subida, respuesta:', data);
                    return data.location;
                  } else {
                    console.error('❌ Respuesta inválida:', data);
                    throw new Error('Respuesta del servidor inválida: falta location');
                  }
                }
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