import { useEffect, useState } from 'react';
import api from '../api';
import type { Correo } from '../types';

function ListaCorreos() {
  const [correos, setCorreos] = useState<Correo[]>([]);
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImportArea, setShowImportArea] = useState(false);
  const [loading, setLoading] = useState(true);
  const [importando, setImportando] = useState(false);

  const cargarCorreos = async () => {
    setLoading(true);
    const res = await api.get('/correos');
    setCorreos(res.data);
    setLoading(false);
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

  // Función para extraer correos del texto
  const extraerCorreos = (texto: string): string[] => {
    const regex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return texto.match(regex) || [];
  };

  // Función para importar correos
  const importarCorreos = async () => {
    setImportando(true);
    const correosExtraidos = extraerCorreos(importText);

    if (correosExtraidos.length === 0) {
      alert('No se encontraron direcciones de correo en el texto');
      setImportando(false);
      return;
    }

    try {
      for (const email of correosExtraidos) {
        await api.post('/agregar', { email });
      }
      setImportText('');
      setShowImportArea(false);
      cargarCorreos();
      alert(`Se importaron ${correosExtraidos.length} correos electrónicos`);
    } catch (error) {
      console.error('Error al importar correos:', error);
      alert('Ocurrió un error al importar los correos');
    }
    setImportando(false);
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
          <button 
            className="btn secondary" 
            onClick={() => setShowImportArea(!showImportArea)}
          >
            {showImportArea ? 'Cancelar' : 'Importar correos'}
          </button>
        </div>

        {showImportArea && (
          <div className="import-section">
            <textarea
              className="textarea"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Pega aquí un texto que contenga direcciones de correo electrónico..."
              rows={5}
            />
            <div className="import-actions">
              <button
                className="btn primary"
                onClick={importarCorreos}
                disabled={importando}
              >
                {importando ? (
                  <span className="spinner" style={{ marginRight: 8 }}></span>
                ) : null}
                {importando ? 'Importando...' : 'Importar correos'}
              </button>
              <button 
                className="btn" 
                onClick={() => {
                  setImportText('');
                  setShowImportArea(false);
                }}
              >
                Cancelar
              </button>
            </div>
            <p className="hint">
              Se detectarán automáticamente todas las direcciones de correo electrónico en el texto.
            </p>
          </div>
        )}

        {loading ? (
          <div className="loading">
            <p>Cargando correos...</p>
          </div>
        ) : correos.length === 0 ? (
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