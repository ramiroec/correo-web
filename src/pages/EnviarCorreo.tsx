import { useState } from 'react';
import api from '../api';

function EnviarCorreo() {
  const [asunto, setAsunto] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [mensaje, setMensaje] = useState('');

  const enviar = async () => {
    if (!asunto || !cuerpo) return;
    try {
      const res = await api.post('/enviar', { asunto, cuerpo });
      setMensaje(res.data);
    } catch (err) {
      setMensaje('Error al enviar');
    }
  };

  return (
    <div>
      <h2>Enviar Correo a Todos</h2>
      <input
        value={asunto}
        onChange={(e) => setAsunto(e.target.value)}
        placeholder="Asunto"
        style={{ width: '100%', marginBottom: 10 }}
      />
      <textarea
        value={cuerpo}
        onChange={(e) => setCuerpo(e.target.value)}
        placeholder="Cuerpo del correo"
        rows={6}
        style={{ width: '100%' }}
      />
      <br />
      <button onClick={enviar}>Enviar</button>

      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}

export default EnviarCorreo;
