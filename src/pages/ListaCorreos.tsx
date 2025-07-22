import { useEffect, useState } from 'react';
import api from '../api';
import type { Correo } from '../types';

function ListaCorreos() {
  const [correos, setCorreos] = useState<Correo[]>([]);
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editEmail, setEditEmail] = useState('');

  const cargarCorreos = async () => {
    const res = await api.get('/correos');
    setCorreos(res.data);
  };

  useEffect(() => {
    cargarCorreos();
  }, []);

  const agregarCorreo = async () => {
    if (!nuevoCorreo) return;
    await api.post('/agregar', { email: nuevoCorreo });
    setNuevoCorreo('');
    cargarCorreos();
  };

  const eliminarCorreo = async (id: number) => {
    if (window.confirm('¿Seguro que deseas eliminar este correo?')) {
      await api.delete(`/correos/${id}`);
      cargarCorreos();
    }
  };

  const iniciarEdicion = (correo: Correo) => {
    setEditId(correo.id);
    setEditEmail(correo.email);
  };

  const cancelarEdicion = () => {
    setEditId(null);
    setEditEmail('');
  };

  const guardarEdicion = async (id: number) => {
    if (!editEmail) return;
    await api.put(`/correos/${id}`, { email: editEmail });
    setEditId(null);
    setEditEmail('');
    cargarCorreos();
  };

  return (
    <div>
      <h2>Lista de Correos</h2>
      <input
        value={nuevoCorreo}
        onChange={(e) => setNuevoCorreo(e.target.value)}
        placeholder="nuevo@correo.com"
      />
      <button onClick={agregarCorreo}>Agregar</button>

      <ul>
        {correos.map((c) => (
          <li key={c.id}>
            {editId === c.id ? (
              <>
                <input
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
                <button onClick={() => guardarEdicion(c.id)}>Guardar</button>
                <button onClick={cancelarEdicion}>Cancelar</button>
              </>
            ) : (
              <>
                {c.email}{' '}
                <button onClick={() => iniciarEdicion(c)}>✏️</button>
                <button onClick={() => eliminarCorreo(c.id)}>🗑️</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListaCorreos;
