import { useEffect, useState } from 'react';
import api from '../api';
import type { Correo, Lista } from '../types';

function ListaCorreos() {
  const [listas, setListas] = useState<Lista[]>([]);
  const [listaSeleccionada, setListaSeleccionada] = useState<number | null>(null);
  const [nombreNuevaLista, setNombreNuevaLista] = useState('');
  const [correos, setCorreos] = useState<Correo[]>([]);
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImportArea, setShowImportArea] = useState(false);
  const [loading, setLoading] = useState(true);
  const [importando, setImportando] = useState(false);

  const cargarListas = async () => {
    const res = await api.get('/listas');
    setListas(res.data);
    if (res.data.length && listaSeleccionada === null) {
      setListaSeleccionada(res.data[0].id);
    }
  };

  const cargarCorreos = async () => {
    if (!listaSeleccionada) return;
    setLoading(true);
    const res = await api.get(`/listas/${listaSeleccionada}/correos`);
    setCorreos(res.data);
    setLoading(false);
  };

  useEffect(() => {
    cargarListas();
  }, []);

  useEffect(() => {
    cargarCorreos();
  }, [listaSeleccionada]);

  const crearLista = async () => {
    if (!nombreNuevaLista.trim()) return;
    await api.post('/listas', { nombre: nombreNuevaLista });
    setNombreNuevaLista('');
    cargarListas();
  };

  const agregarCorreo = async () => {
    if (!nuevoCorreo.trim() || !listaSeleccionada) return;
    await api.post(`/listas/${listaSeleccionada}/correos`, { email: nuevoCorreo });
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

  const extraerCorreos = (texto: string): string[] => {
    const regex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return texto.match(regex) || [];
  };

  const importarCorreos = async () => {
    setImportando(true);
    const correosExtraidos = extraerCorreos(importText);

    if (correosExtraidos.length === 0) {
      alert('No se encontraron direcciones de correo');
      setImportando(false);
      return;
    }

    try {
      for (const email of correosExtraidos) {
        await api.post(`/listas/${listaSeleccionada}/correos`, { email });
      }
      setImportText('');
      setShowImportArea(false);
      cargarCorreos();
      alert(`Se importaron ${correosExtraidos.length} correos`);
    } catch (err) {
      console.error('Error al importar:', err);
      alert('Error al importar correos');
    }
    setImportando(false);
  };

  const eliminarLista = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas borrar esta lista?')) return;
    await api.delete(`/listas/${id}`);
    // Si la lista eliminada era la seleccionada, selecciona otra
    if (id === listaSeleccionada) {
      setListaSeleccionada(null);
      setCorreos([]);
    }
    cargarListas();
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <div className="container">
        <header className="header">
          <h1>Listas de Correos</h1>
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </header>

        <div className="listas-section">
          <select
            className="input"
            value={listaSeleccionada ?? ''}
            onChange={(e) => setListaSeleccionada(Number(e.target.value))}
          >
            {listas.map((lista) => (
              <option key={lista.id} value={lista.id}>
                {lista.nombre}
              </option>
            ))}
          </select>
          {listaSeleccionada && (
            <button
              className="btn danger"
              style={{ marginLeft: 8 }}
              onClick={() => eliminarLista(listaSeleccionada)}
              title="Eliminar lista"
            >
              🗑️
            </button>
          )}

          <div className="new-list">
            <input
              className="input"
              placeholder="Nombre nueva lista"
              value={nombreNuevaLista}
              onChange={(e) => setNombreNuevaLista(e.target.value)}
            />
            <button className="btn primary" onClick={crearLista}>
              Crear lista
            </button>
          </div>
        </div>

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
          <button className="btn secondary" onClick={() => setShowImportArea(!showImportArea)}>
            {showImportArea ? 'Cancelar' : 'Importar correos'}
          </button>
        </div>

        {showImportArea && (
          <div className="import-section">
            <textarea
              className="textarea"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Pega aquí un texto con correos..."
              rows={5}
            />
            <div className="import-actions">
              <button className="btn primary" onClick={importarCorreos} disabled={importando}>
                {importando ? 'Importando...' : 'Importar correos'}
              </button>
              <button className="btn" onClick={() => { setImportText(''); setShowImportArea(false); }}>
                Cancelar
              </button>
            </div>
            <p className="hint">Se detectarán todas las direcciones de correo del texto.</p>
          </div>
        )}

        {loading ? (
          <div className="loading"><p>Cargando correos...</p></div>
        ) : correos.length === 0 ? (
          <div className="empty"><p>No hay correos en esta lista</p></div>
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
                      <button className="btn success" onClick={() => guardarEdicion(correo.id)}>✓</button>
                      <button className="btn" onClick={cancelarEdicion}>✕</button>
                    </div>
                  </div>
                ) : (
                  <div className="view-mode">
                    <span className="email">{correo.email}</span>
                    <div className="actions">
                      <button className="btn" onClick={() => iniciarEdicion(correo)}>✏️</button>
                      <button className="btn danger" onClick={() => eliminarCorreo(correo.id)}>🗑️</button>
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
