import { useEffect, useState } from 'react';
import api from '../api';
import type { Correo } from '../types';

function ListaCorreos() {
  const [correos, setCorreos] = useState<Correo[]>([]);
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const cargarCorreos = async () => {
    const res = await api.get('/correos');
    setCorreos(res.data);
  };

  useEffect(() => {
    cargarCorreos();
  }, []);

  const agregarCorreo = async () => {
    if (!nuevoCorreo.trim()) return;
    await api.post('/agregar', { email: nuevoCorreo });
    setNuevoCorreo('');
    cargarCorreos();
  };

  const eliminarCorreo = async (id: number) => {
    if (window.confirm('¿Eliminar este correo?')) {
      await api.delete(`/correos/${id}`);
      cargarCorreos();
    }
  };

  const iniciarEdicion = (correo: Correo) => {
    setEditId(correo.id);
    setEditEmail(correo.email);
  };

  const guardarEdicion = async (id: number) => {
    if (!editEmail.trim()) return;
    await api.put(`/correos/${id}`, { email: editEmail });
    setEditId(null);
    setEditEmail('');
    cargarCorreos();
  };

  const cancelarEdicion = () => {
    setEditId(null);
    setEditEmail('');
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <div className="container">
        <header className="header">
          <h1>Lista de Correos</h1>
          <button 
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </header>

        <div className="add-section">
          <input
            className="input"
            value={nuevoCorreo}
            onChange={(e) => setNuevoCorreo(e.target.value)}
            placeholder="nuevo@correo.com"
            onKeyPress={(e) => e.key === 'Enter' && agregarCorreo()}
          />
          <button className="btn primary" onClick={agregarCorreo}>
            Agregar
          </button>
        </div>

        {correos.length === 0 ? (
          <div className="empty">
            <p>No hay correos registrados</p>
          </div>
        ) : (
          <div className="emails">
            {correos.map((correo) => (
              <div key={correo.id} className="email-item">
                {editId === correo.id ? (
                  <div className="edit-mode">
                    <input
                      className="input"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && guardarEdicion(correo.id)}
                    />
                    <div className="actions">
                      <button className="btn success" onClick={() => guardarEdicion(correo.id)}>
                        ✓
                      </button>
                      <button className="btn" onClick={cancelarEdicion}>
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="view-mode">
                    <span className="email">{correo.email}</span>
                    <div className="actions">
                      <button className="btn" onClick={() => iniciarEdicion(correo)}>
                        ✏️
                      </button>
                      <button className="btn danger" onClick={() => eliminarCorreo(correo.id)}>
                        🗑️
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ListaCorreos;